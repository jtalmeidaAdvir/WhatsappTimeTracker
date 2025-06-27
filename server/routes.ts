import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { whatsappService } from "./services/whatsapp";
import { z } from "zod";
import { insertEmployeeSchema, insertWhatsappMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Employee routes
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getAllEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.get("/api/employees/status", async (req, res) => {
    try {
      const employeesWithStatus = await storage.getEmployeesWithStatus();
      res.json(employeesWithStatus);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employee status" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const employeeData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(employeeData);
      res.status(201).json(employee);
    } catch (error) {
      res.status(400).json({ message: "Invalid employee data" });
    }
  });

  app.put("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const employeeData = insertEmployeeSchema.partial().parse(req.body);
      const employee = await storage.updateEmployee(id, employeeData);
      
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      res.json(employee);
    } catch (error) {
      res.status(400).json({ message: "Invalid employee data" });
    }
  });

  // Update employee
  app.put("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = insertEmployeeSchema.partial().safeParse(req.body);
      
      if (result.success) {
        const updatedEmployee = await storage.updateEmployee(id, result.data);
        if (updatedEmployee) {
          res.json(updatedEmployee);
        } else {
          res.status(404).json({ message: "Employee not found" });
        }
      } else {
        res.status(400).json({ message: "Invalid employee data" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  // Delete employee (deactivate)
  app.delete("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deactivatedEmployee = await storage.updateEmployee(id, { isActive: false });
      if (deactivatedEmployee) {
        res.json({ message: "Employee deactivated successfully" });
      } else {
        res.status(404).json({ message: "Employee not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to deactivate employee" });
    }
  });

  // Attendance routes
  app.get("/api/attendance", async (req, res) => {
    try {
      const employeeId = req.query.employeeId ? parseInt(req.query.employeeId as string) : undefined;
      const date = req.query.date ? new Date(req.query.date as string) : undefined;
      
      const records = await storage.getAttendanceRecords(employeeId, date);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendance records" });
    }
  });

  // WhatsApp webhook route for Z-API
  app.post("/api/whatsapp/webhook", async (req, res) => {
    try {
      console.log("Z-API Webhook received:", JSON.stringify(req.body, null, 2));
      
      const messageData = req.body;
      
      // Skip only bot responses and test messages based on content, not fromMe flag
      if (messageData.text && messageData.text.message) {
        const message = messageData.text.message;
        // Skip Z-API test messages and our bot responses to prevent loops
        if (message.includes("_Enviada por uma conta TESTE") || 
            message.includes("*Sua mensagem abaixo:*") ||
            message.includes("✅ Entrada registrada") ||
            message.includes("✅ Saída registrada") ||
            message.includes("✅ Pausa iniciada") ||
            message.includes("✅ Volta da pausa") ||
            message.includes("❌") ||
            message.includes("📋 *Comandos disponíveis:*") ||
            message.includes("Envie apenas a palavra do comando")) {
          console.log("Skipping bot response or test message based on content");
          return res.json({ success: true, message: "Bot response ignored" });
        }
      }
      
      // Z-API message format can vary, handle multiple formats
      let phone = null;
      let messageText = null;
      
      // Z-API webhook format - handle text.message structure
      if (messageData.phone && messageData.text && messageData.text.message) {
        phone = messageData.phone.toString();
        messageText = messageData.text.message;
      }
      // Alternative format - direct message
      else if (messageData.phone && messageData.message) {
        phone = messageData.phone.toString();
        messageText = typeof messageData.message === 'string' ? messageData.message : messageData.message.text;
      }
      // Data wrapper format
      else if (messageData.data && messageData.data.phone && messageData.data.message) {
        phone = messageData.data.phone.toString();
        messageText = typeof messageData.data.message === 'string' ? messageData.data.message : messageData.data.message.text;
      }
      
      if (phone && messageText) {
        // Clean phone number format - handle both with and without + 
        const cleanPhone = phone.toString().replace(/[^\d]/g, '');
        const formattedPhone = `+${cleanPhone}`;
        
        console.log(`Processing webhook message from ${formattedPhone}: ${messageText}`);

        const response = await whatsappService.processMessage(formattedPhone, messageText);
        
        // Send response back to WhatsApp
        await whatsappService.sendMessage(formattedPhone, response);
        
        res.json({ success: true, response });
      } else {
        // Return success for other webhook events (status updates, etc.)
        console.log(`Webhook received but no processable message. Phone: ${phone}, Text: ${messageText}`);
        res.json({ success: true, message: "Webhook received" });
      }
    } catch (error) {
      console.error("WhatsApp webhook error:", error);
      res.status(500).json({ message: "Failed to process WhatsApp message" });
    }
  });

  // WhatsApp messages route
  app.get("/api/whatsapp/messages", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const messages = await storage.getRecentMessages(limit);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Stats route
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.get("/api/settings/:key", async (req, res) => {
    try {
      const setting = await storage.getSetting(req.params.key);
      if (setting) {
        res.json(setting);
      } else {
        res.status(404).json({ message: "Setting not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch setting" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const { settings } = req.body;
      if (!Array.isArray(settings)) {
        return res.status(400).json({ message: "Settings must be an array" });
      }

      const updatedSettings = [];
      for (const setting of settings) {
        const { key, value, type } = setting;
        if (!key || value === undefined) {
          continue;
        }
        const updated = await storage.setSetting(key, value.toString(), type || "string");
        updatedSettings.push(updated);
      }

      res.json({ message: "Settings updated successfully", settings: updatedSettings });
    } catch (error) {
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // Test route to simulate WhatsApp message
  app.post("/api/whatsapp/simulate", async (req, res) => {
    try {
      const { phone, message } = req.body;
      
      if (!phone || !message) {
        return res.status(400).json({ message: "Phone and message are required" });
      }

      const response = await whatsappService.processMessage(phone, message);
      res.json({ success: true, response });
    } catch (error) {
      console.error("WhatsApp simulation error:", error);
      res.status(500).json({ message: "Failed to simulate WhatsApp message" });
    }
  });

  // Manual message processing route
  app.post("/api/whatsapp/process-manual", async (req, res) => {
    try {
      const { phone, message } = req.body;
      
      if (!phone || !message) {
        return res.status(400).json({ message: "Phone and message are required" });
      }

      console.log(`Manual processing: ${phone} sent "${message}"`);
      
      const response = await whatsappService.processMessage(phone, message);
      
      // Send response back to WhatsApp
      await whatsappService.sendMessage(phone, response);
      
      res.json({ success: true, response, message: "Message processed and response sent" });
    } catch (error) {
      console.error("Manual processing error:", error);
      res.status(500).json({ message: "Failed to process message manually" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
