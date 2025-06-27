import type { Express } from "express";
import { 
  employees, 
  attendanceRecords, 
  whatsappMessages,
  settings,
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
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Employee methods
  getEmployee(id: number): Promise<Employee | undefined>;
  getEmployeeByPhone(phone: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  getAllEmployees(): Promise<Employee[]>;
  getEmployeesWithStatus(): Promise<EmployeeWithStatus[]>;

  // Attendance methods
  createAttendanceRecord(record: InsertAttendanceRecord): Promise<AttendanceRecord>;
  getAttendanceRecords(employeeId?: number, date?: Date): Promise<AttendanceRecord[]>;
  getLatestAttendanceRecord(employeeId: number): Promise<AttendanceRecord | undefined>;

  // WhatsApp methods
  createWhatsappMessage(message: InsertWhatsappMessage): Promise<WhatsappMessage>;
  getUnprocessedMessages(): Promise<WhatsappMessage[]>;
  markMessageAsProcessed(id: number, response: string): Promise<void>;
  getRecentMessages(limit?: number): Promise<WhatsappMessage[]>;

  // Stats methods
  getStats(): Promise<{
    activeEmployees: number;
    presentToday: number;
    onBreak: number;
    messagesProcessed: number;
  }>;

  // Settings methods
  getSetting(key: string): Promise<Setting | undefined>;
  setSetting(key: string, value: string, type?: string): Promise<Setting>;
  getAllSettings(): Promise<Setting[]>;
}

export class DatabaseStorage implements IStorage {
  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee || undefined;
  }

  async getEmployeeByPhone(phone: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.phone, phone));
    return employee || undefined;
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const [employee] = await db
      .insert(employees)
      .values(insertEmployee)
      .returning();
    return employee;
  }

  async updateEmployee(id: number, updateData: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const [employee] = await db
      .update(employees)
      .set(updateData)
      .where(eq(employees.id, id))
      .returning();
    return employee || undefined;
  }

  async getAllEmployees(): Promise<Employee[]> {
    return await db.select().from(employees).orderBy(employees.name);
  }

  async getEmployeesWithStatus(): Promise<EmployeeWithStatus[]> {
    const allEmployees = await this.getAllEmployees();
    const employeesWithStatus: EmployeeWithStatus[] = [];

    for (const employee of allEmployees) {
      const latestRecord = await this.getLatestAttendanceRecord(employee.id);
      
      let currentStatus: 'trabalhando' | 'pausa' | 'ausente' | 'saiu' = 'ausente';
      let clockInTime: string | undefined;
      let lastAction: string | undefined;
      let lastActionTime: Date | undefined;

      if (latestRecord) {
        lastAction = latestRecord.type;
        lastActionTime = latestRecord.timestamp;

        if (latestRecord.type === 'entrada') {
          currentStatus = 'trabalhando';
          clockInTime = latestRecord.timestamp.toTimeString().slice(0, 5);
        } else if (latestRecord.type === 'pausa') {
          currentStatus = 'pausa';
        } else if (latestRecord.type === 'volta') {
          currentStatus = 'trabalhando';
        } else if (latestRecord.type === 'saida') {
          currentStatus = 'saiu';
        }
      }

      employeesWithStatus.push({
        ...employee,
        currentStatus,
        clockInTime,
        lastAction,
        lastActionTime
      });
    }

    return employeesWithStatus;
  }

  async createAttendanceRecord(insertRecord: InsertAttendanceRecord): Promise<AttendanceRecord> {
    const [record] = await db
      .insert(attendanceRecords)
      .values(insertRecord)
      .returning();
    return record;
  }

  async getAttendanceRecords(employeeId?: number, date?: Date): Promise<AttendanceRecord[]> {
    const conditions = [];
    
    if (employeeId) {
      conditions.push(eq(attendanceRecords.employeeId, employeeId));
    }
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      conditions.push(
        sql`${attendanceRecords.timestamp} >= ${startOfDay}`,
        sql`${attendanceRecords.timestamp} <= ${endOfDay}`
      );
    }

    let query = db.select().from(attendanceRecords);
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(attendanceRecords.timestamp));
  }

  async getLatestAttendanceRecord(employeeId: number): Promise<AttendanceRecord | undefined> {
    const [record] = await db
      .select()
      .from(attendanceRecords)
      .where(eq(attendanceRecords.employeeId, employeeId))
      .orderBy(desc(attendanceRecords.timestamp))
      .limit(1);
    return record || undefined;
  }

  async createWhatsappMessage(insertMessage: InsertWhatsappMessage): Promise<WhatsappMessage> {
    const [message] = await db
      .insert(whatsappMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getUnprocessedMessages(): Promise<WhatsappMessage[]> {
    return await db
      .select()
      .from(whatsappMessages)
      .where(eq(whatsappMessages.processed, false))
      .orderBy(whatsappMessages.timestamp);
  }

  async markMessageAsProcessed(id: number, response: string): Promise<void> {
    await db
      .update(whatsappMessages)
      .set({ processed: true, response })
      .where(eq(whatsappMessages.id, id));
  }

  async getRecentMessages(limit = 10): Promise<WhatsappMessage[]> {
    return await db
      .select()
      .from(whatsappMessages)
      .orderBy(desc(whatsappMessages.timestamp))
      .limit(limit);
  }

  async getStats(): Promise<{
    activeEmployees: number;
    presentToday: number;
    onBreak: number;
    messagesProcessed: number;
  }> {
    const activeEmployees = await db
      .select({ count: sql<number>`count(*)` })
      .from(employees)
      .where(eq(employees.isActive, true));

    const employeesWithStatus = await this.getEmployeesWithStatus();
    const presentToday = employeesWithStatus.filter(e => 
      e.currentStatus === 'trabalhando' || e.currentStatus === 'pausa'
    ).length;
    const onBreak = employeesWithStatus.filter(e => e.currentStatus === 'pausa').length;

    const processedMessages = await db
      .select({ count: sql<number>`count(*)` })
      .from(whatsappMessages)
      .where(eq(whatsappMessages.processed, true));

    return {
      activeEmployees: activeEmployees[0].count,
      presentToday,
      onBreak,
      messagesProcessed: processedMessages[0].count,
    };
  }

  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting || undefined;
  }

  async setSetting(key: string, value: string, type = "string"): Promise<Setting> {
    const existingSetting = await this.getSetting(key);
    
    if (existingSetting) {
      const [updated] = await db
        .update(settings)
        .set({ value, type, updatedAt: new Date() })
        .where(eq(settings.key, key))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(settings)
        .values({ key, value, type })
        .returning();
      return created;
    }
  }

  async getAllSettings(): Promise<Setting[]> {
    return await db.select().from(settings).orderBy(settings.key);
  }
}

export const storage = new DatabaseStorage();