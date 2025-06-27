import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const employees = sqliteTable("employees", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    phone: text("phone").notNull().unique(),
    department: text("department").notNull(),
    isActive: integer("is_active", { mode: 'boolean' }).notNull().default(1),
    createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const attendanceRecords = sqliteTable("attendance_records", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    employeeId: integer("employee_id").notNull().references(() => employees.id),
    type: text("type").notNull(), // 'entrada', 'saida', 'pausa', 'volta'
    timestamp: text("timestamp").notNull().default(new Date().toISOString()),
    message: text("message"),
});

export const whatsappMessages = sqliteTable("whatsapp_messages", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    phone: text("phone").notNull(),
    message: text("message").notNull(),
    command: text("command"),
    processed: integer("processed", { mode: 'boolean' }).notNull().default(0),
    response: text("response"),
    timestamp: text("timestamp").notNull().default(new Date().toISOString()),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
    id: true,
    createdAt: true,
});

export const insertAttendanceRecordSchema = createInsertSchema(attendanceRecords).omit({
    id: true,
    timestamp: true,
});

export const insertWhatsappMessageSchema = createInsertSchema(whatsappMessages).omit({
    id: true,
    timestamp: true,
    processed: true,
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type InsertAttendanceRecord = z.infer<typeof insertAttendanceRecordSchema>;
export type WhatsappMessage = typeof whatsappMessages.$inferSelect;
export type InsertWhatsappMessage = z.infer<typeof insertWhatsappMessageSchema>;

export type EmployeeWithStatus = Employee & {
    currentStatus: 'trabalhando' | 'pausa' | 'ausente' | 'saiu';
    clockInTime?: string;
    lastAction?: string;
    lastActionTime?: Date;
};

// Settings table
export const settings = sqliteTable("settings", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    key: text("key").notNull().unique(),
    value: text("value").notNull(),
    type: text("type").notNull().default("string"), // string, number, boolean
    updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const insertSettingSchema = createInsertSchema(settings);

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;