import { storage } from "../storage";
import type { InsertAttendanceRecord } from "@shared/schema";

export class WhatsAppService {
  private readonly validCommands = ['entrada', 'saida', 'pausa', 'volta'];

  async processMessage(phone: string, message: string): Promise<string> {
    const command = this.extractCommand(message.toLowerCase().trim());
    
    // Save the incoming message
    await storage.createWhatsappMessage({
      phone,
      message,
      command: command || undefined,
    });

    if (!command) {
      return this.getHelpMessage();
    }

    const employee = await storage.getEmployeeByPhone(phone);
    if (!employee) {
      return "Funcionário não encontrado. Entre em contato com o RH para cadastro.";
    }

    if (!employee.isActive) {
      return "Sua conta está inativa. Entre em contato com o RH.";
    }

    const response = await this.executeCommand(employee.id, command);
    
    // Mark message as processed
    const messages = await storage.getUnprocessedMessages();
    const messageRecord = messages.find(m => m.phone === phone && m.message === message);
    if (messageRecord) {
      await storage.markMessageAsProcessed(messageRecord.id, response);
    }

    return response;
  }

  private extractCommand(message: string): string | null {
    const words = message.split(/\s+/);
    for (const word of words) {
      if (this.validCommands.includes(word)) {
        return word;
      }
    }
    return null;
  }

  private async executeCommand(employeeId: number, command: string): Promise<string> {
    const employee = await storage.getEmployee(employeeId);
    if (!employee) {
      return "Erro interno. Tente novamente.";
    }

    const latestRecord = await storage.getLatestAttendanceRecord(employeeId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if there's already a record today
    const todaysRecords = await storage.getAttendanceRecords(employeeId, today);
    
    switch (command) {
      case 'entrada':
        return this.handleEntrada(employeeId, employee.name, todaysRecords);
      
      case 'saida':
        return this.handleSaida(employeeId, employee.name, todaysRecords);
      
      case 'pausa':
        return this.handlePausa(employeeId, employee.name, latestRecord);
      
      case 'volta':
        return this.handleVolta(employeeId, employee.name, latestRecord);
      
      default:
        return this.getHelpMessage();
    }
  }

  private async handleEntrada(employeeId: number, employeeName: string, todaysRecords: any[]): Promise<string> {
    const hasEntrada = todaysRecords.some(r => r.type === 'entrada');
    
    if (hasEntrada) {
      return `${employeeName}, você já registrou entrada hoje!`;
    }

    // Validate work hours
    const workHoursValidation = await this.validateWorkHours();
    if (!workHoursValidation.isValid) {
      return workHoursValidation.message;
    }

    await storage.createAttendanceRecord({
      employeeId,
      type: 'entrada',
      message: 'Entrada registrada via WhatsApp',
    });

    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    return `✅ Entrada registrada com sucesso!\n⏰ Horário: ${timeStr}\n👤 Funcionário: ${employeeName}`;
  }

  private async handleSaida(employeeId: number, employeeName: string, todaysRecords: any[]): Promise<string> {
    const hasEntrada = todaysRecords.some(r => r.type === 'entrada');
    const hasSaida = todaysRecords.some(r => r.type === 'saida');
    
    if (!hasEntrada) {
      return `${employeeName}, você precisa registrar entrada primeiro!`;
    }

    if (hasSaida) {
      return `${employeeName}, você já registrou saída hoje!`;
    }

    await storage.createAttendanceRecord({
      employeeId,
      type: 'saida',
      message: 'Saída registrada via WhatsApp',
    });

    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    return `✅ Saída registrada com sucesso!\n⏰ Horário: ${timeStr}\n👤 Funcionário: ${employeeName}`;
  }

  private async handlePausa(employeeId: number, employeeName: string, latestRecord: any): Promise<string> {
    if (!latestRecord || latestRecord.type !== 'entrada' && latestRecord.type !== 'volta') {
      return `${employeeName}, você precisa estar trabalhando para fazer pausa!`;
    }

    if (latestRecord.type === 'pausa') {
      return `${employeeName}, você já está em pausa!`;
    }

    await storage.createAttendanceRecord({
      employeeId,
      type: 'pausa',
      message: 'Pausa iniciada via WhatsApp',
    });

    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    return `⏸️ Pausa iniciada!\n⏰ Horário: ${timeStr}\n👤 Funcionário: ${employeeName}`;
  }

  private async handleVolta(employeeId: number, employeeName: string, latestRecord: any): Promise<string> {
    if (!latestRecord || latestRecord.type !== 'pausa') {
      return `${employeeName}, você não está em pausa!`;
    }

    await storage.createAttendanceRecord({
      employeeId,
      type: 'volta',
      message: 'Volta da pausa via WhatsApp',
    });

    const now = new Date();
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    return `▶️ Volta da pausa registrada!\n⏰ Horário: ${timeStr}\n👤 Funcionário: ${employeeName}`;
  }

  private async validateWorkHours(): Promise<{ isValid: boolean; message: string }> {
    try {
      // Get work hours settings
      const startTimeSetting = await storage.getSetting('startTime');
      const endTimeSetting = await storage.getSetting('endTime');
      
      // Default work hours if not configured
      const startTime = startTimeSetting?.value || '08:00';
      const endTime = endTimeSetting?.value || '17:00';
      
      // Use Portuguese timezone
      const now = new Date();
      const currentTime = now.toLocaleTimeString('pt-PT', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      
      // Convert time strings to minutes for comparison
      const timeToMinutes = (time: string): number => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      };
      
      const currentMinutes = timeToMinutes(currentTime);
      const startMinutes = timeToMinutes(startTime);
      const endMinutes = timeToMinutes(endTime);
      
      // Check if current time is within work hours
      if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
        return {
          isValid: false,
          message: `⏰ Fora do horário de trabalho!\n📅 Horário permitido: ${startTime} às ${endTime}\n🕐 Horário atual: ${currentTime}\n\nTente registrar entrada dentro do horário de trabalho.`
        };
      }
      
      return { isValid: true, message: '' };
    } catch (error) {
      console.error('Error validating work hours:', error);
      // If there's an error getting settings, allow entry (fail open)
      return { isValid: true, message: '' };
    }
  }

  private getHelpMessage(): string {
    return `📋 *Comandos disponíveis:*\n\n` +
           `🟢 *entrada* - Marcar entrada\n` +
           `🔴 *saida* - Marcar saída\n` +
           `🟡 *pausa* - Iniciar pausa\n` +
           `🟢 *volta* - Voltar da pausa\n\n` +
           `Envie apenas a palavra do comando.`;
  }

    async sendMessage(phone: string, message: string): Promise<void> {
        try {
            const instanceId = "3E34A6DE70CA90866206EA0C62B464CE";
            const token = "7E852B60B0AE2417339AA89A";
            const clientToken = "F7f29442191384316b26f68bbdc6653a5S"; // Seu Client-Token

            const apiUrl = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`;

            const cleanPhone = phone.replace(/[+\s]/g, '');

            const payload = { phone: cleanPhone, message };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Client-Token': clientToken,  // <-- Inclua aqui
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(`Z-API error: ${response.status} ${response.statusText} - ${JSON.stringify(result)}`);
            }

            // Z-API returns success with different formats, check for message ID as success indicator
            if (result.zaapId || result.messageId || result.id) {
                console.log(`Mensagem enviada com sucesso para ${phone}:`, result.messageId || result.id);
            } else {
                console.log(`Resposta Z-API para ${phone}:`, result);
            }
        } catch (error) {
            console.error(`Falha ao enviar mensagem para ${phone}:`, error);
        }
    }

}

export const whatsappService = new WhatsAppService();
