import type { Express } from "express";
import {
    type Employee,
    type InsertEmployee,
    type AttendanceRecord,
    type InsertAttendanceRecord,
    type WhatsappMessage,
    type InsertWhatsappMessage,
    type EmployeeWithStatus,
    type Setting,
    type InsertSetting
} from "@shared/schema";
import { pool } from './db';
import sql from 'mssql';

export interface IStorage {
    getEmployee(id: number): Promise<Employee | undefined>;
    getEmployeeByPhone(phone: string): Promise<Employee | undefined>;
    createEmployee(employee: InsertEmployee): Promise<Employee>;
    updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
    getAllEmployees(): Promise<Employee[]>;
    getEmployeesWithStatus(): Promise<EmployeeWithStatus[]>;
    createAttendanceRecord(record: InsertAttendanceRecord): Promise<AttendanceRecord>;
    getAttendanceRecords(employeeId?: number, date?: Date): Promise<AttendanceRecord[]>;
    getLatestAttendanceRecord(employeeId: number): Promise<AttendanceRecord | undefined>;
    createWhatsappMessage(message: InsertWhatsappMessage): Promise<WhatsappMessage>;
    getUnprocessedMessages(): Promise<WhatsappMessage[]>;
    markMessageAsProcessed(id: number, response: string): Promise<void>;
    getRecentMessages(limit?: number): Promise<WhatsappMessage[]>;
    getStats(): Promise<{
        activeEmployees: number;
        presentToday: number;
        onBreak: number;
        messagesProcessed: number;
    }>;
    getSetting(key: string): Promise<Setting | undefined>;
    setSetting(key: string, value: string, type?: string): Promise<Setting>;
    getAllSettings(): Promise<Setting[]>;
}

export class DatabaseStorage implements IStorage {
    async getEmployee(id: number): Promise<Employee | undefined> {
        const result = await pool.request().input("id", sql.Int, id).query("SELECT * FROM employees WHERE id = @id");
        return result.recordset[0];
    }

    async getEmployeeByPhone(phone: string): Promise<Employee | undefined> {
        const result = await pool.request().input("phone", sql.VarChar, phone).query("SELECT * FROM employees WHERE phone = @phone");
        return result.recordset[0];
    }

    async createEmployee(employee: InsertEmployee): Promise<Employee> {
        const result = await pool.request()
            .input("name", sql.VarChar, employee.name)
            .input("phone", sql.VarChar, employee.phone)
            .input("isActive", sql.Bit, employee.isActive)
            .query("INSERT INTO employees (name, phone, isActive) OUTPUT INSERTED.* VALUES (@name, @phone, @isActive)");
        return result.recordset[0];
    }

    async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
        const fields = [];
        const request = pool.request().input("id", sql.Int, id);
        if (employee.name) {
            fields.push("name = @name");
            request.input("name", sql.VarChar, employee.name);
        }
        if (employee.phone) {
            fields.push("phone = @phone");
            request.input("phone", sql.VarChar, employee.phone);
        }
        if (employee.isActive !== undefined) {
            fields.push("isActive = @isActive");
            request.input("isActive", sql.Bit, employee.isActive);
        }
        const query = `UPDATE employees SET ${fields.join(", ")} OUTPUT INSERTED.* WHERE id = @id`;
        const result = await request.query(query);
        return result.recordset[0];
    }

    async getAllEmployees(): Promise<Employee[]> {
        const result = await pool.request().query("SELECT * FROM employees ORDER BY name");
        return result.recordset;
    }

    async getEmployeesWithStatus(): Promise<EmployeeWithStatus[]> {
        const employees = await this.getAllEmployees();
        const withStatus: EmployeeWithStatus[] = [];
        for (const emp of employees) {
            const latest = await this.getLatestAttendanceRecord(emp.id);
            let currentStatus: EmployeeWithStatus["currentStatus"] = 'ausente';
            let clockInTime;
            let lastAction;
            let lastActionTime;
            if (latest) {
                lastAction = latest.type;
                lastActionTime = latest.timestamp;
                if (latest.type === 'entrada' || latest.type === 'volta') {
                    currentStatus = 'trabalhando';
                    clockInTime = latest.timestamp.toTimeString().slice(0, 5);
                } else if (latest.type === 'pausa') {
                    currentStatus = 'pausa';
                } else if (latest.type === 'saida') {
                    currentStatus = 'saiu';
                }
            }
            withStatus.push({ ...emp, currentStatus, clockInTime, lastAction, lastActionTime });
        }
        return withStatus;
    }

    async createAttendanceRecord(record: InsertAttendanceRecord): Promise<AttendanceRecord> {
        const result = await pool.request()
            .input("employeeId", sql.Int, record.employeeId)
            .input("type", sql.VarChar, record.type)
            .input("timestamp", sql.DateTime, record.timestamp)
            .query("INSERT INTO attendanceRecords (employeeId, type, timestamp) OUTPUT INSERTED.* VALUES (@employeeId, @type, @timestamp)");
        return result.recordset[0];
    }

    async getAttendanceRecords(employeeId?: number, date?: Date): Promise<AttendanceRecord[]> {
        const request = pool.request();
        let query = "SELECT * FROM attendanceRecords";
        const conditions = [];
        if (employeeId !== undefined) {
            conditions.push("employeeId = @employeeId");
            request.input("employeeId", sql.Int, employeeId);
        }
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            conditions.push("timestamp >= @start AND timestamp <= @end");
            request.input("start", sql.DateTime, start);
            request.input("end", sql.DateTime, end);
        }
        if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");
        query += " ORDER BY timestamp DESC";
        const result = await request.query(query);
        return result.recordset;
    }

    async getLatestAttendanceRecord(employeeId: number): Promise<AttendanceRecord | undefined> {
        const result = await pool.request()
            .input("employeeId", sql.Int, employeeId)
            .query("SELECT TOP 1 * FROM attendanceRecords WHERE employeeId = @employeeId ORDER BY timestamp DESC");
        return result.recordset[0];
    }

    async createWhatsappMessage(message: InsertWhatsappMessage): Promise<WhatsappMessage> {
        const result = await pool.request()
            .input("sender", sql.VarChar, message.sender)
            .input("message", sql.VarChar, message.message)
            .input("timestamp", sql.DateTime, message.timestamp)
            .input("processed", sql.Bit, message.processed)
            .query("INSERT INTO whatsappMessages (sender, message, timestamp, processed) OUTPUT INSERTED.* VALUES (@sender, @message, @timestamp, @processed)");
        return result.recordset[0];
    }

    async getUnprocessedMessages(): Promise<WhatsappMessage[]> {
        const result = await pool.request().query("SELECT * FROM whatsappMessages WHERE processed = 0 ORDER BY timestamp");
        return result.recordset;
    }

    async markMessageAsProcessed(id: number, response: string): Promise<void> {
        await pool.request()
            .input("id", sql.Int, id)
            .input("response", sql.VarChar, response)
            .query("UPDATE whatsappMessages SET processed = 1, response = @response WHERE id = @id");
    }

    async getRecentMessages(limit = 10): Promise<WhatsappMessage[]> {
        const result = await pool.request()
            .input("limit", sql.Int, limit)
            .query("SELECT TOP (@limit) * FROM whatsappMessages ORDER BY timestamp DESC");
        return result.recordset;
    }

    async getStats(): Promise<{
        activeEmployees: number;
        presentToday: number;
        onBreak: number;
        messagesProcessed: number;
    }> {
        const activeRes = await pool.request().query("SELECT COUNT(*) as count FROM employees WHERE isActive = 1");
        const messagesRes = await pool.request().query("SELECT COUNT(*) as count FROM whatsappMessages WHERE processed = 1");
        const employeesWithStatus = await this.getEmployeesWithStatus();
        const presentToday = employeesWithStatus.filter(e => e.currentStatus === 'trabalhando' || e.currentStatus === 'pausa').length;
        const onBreak = employeesWithStatus.filter(e => e.currentStatus === 'pausa').length;
        return {
            activeEmployees: activeRes.recordset[0].count,
            presentToday,
            onBreak,
            messagesProcessed: messagesRes.recordset[0].count
        };
    }

    async getSetting(key: string): Promise<Setting | undefined> {
        const result = await pool.request().input("key", sql.VarChar, key).query("SELECT * FROM settings WHERE key = @key");
        return result.recordset[0];
    }

    async setSetting(key: string, value: string, type = "string"): Promise<Setting> {
        const existing = await this.getSetting(key);
        if (existing) {
            const result = await pool.request()
                .input("key", sql.VarChar, key)
                .input("value", sql.VarChar, value)
                .input("type", sql.VarChar, type)
                .input("updatedAt", sql.DateTime, new Date())
                .query("UPDATE settings SET value = @value, type = @type, updatedAt = @updatedAt OUTPUT INSERTED.* WHERE key = @key");
            return result.recordset[0];
        } else {
            const result = await pool.request()
                .input("key", sql.VarChar, key)
                .input("value", sql.VarChar, value)
                .input("type", sql.VarChar, type)
                .query("INSERT INTO settings (key, value, type) OUTPUT INSERTED.* VALUES (@key, @value, @type)");
            return result.recordset[0];
        }
    }

    async getAllSettings(): Promise<Setting[]> {
        const result = await pool.request().query("SELECT * FROM settings ORDER BY key");
        return result.recordset;
    }
}

export const storage = new DatabaseStorage();
