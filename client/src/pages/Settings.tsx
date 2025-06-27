import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Bell, Clock, Users, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Setting } from "@shared/schema";

interface SettingsForm {
  companyName: string;
  workHours: number;
  lunchTime: number;
  weekendWork: boolean;
  lateArrival: boolean;
  missingCheckout: boolean;
  longBreaks: boolean;
  dailySummary: boolean;
  startTime: string;
  endTime: string;
  tolerance: number;
  maxBreak: number;
  autoRegister: boolean;
  requireApproval: boolean;
  adminPhone: string;
  twoFactor: boolean;
  locationVerify: boolean;
  auditLog: boolean;
  backupEnable: boolean;
}

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<SettingsForm>({
    companyName: "",
    workHours: 8,
    lunchTime: 60,
    weekendWork: false,
    lateArrival: true,
    missingCheckout: true,
    longBreaks: true,
    dailySummary: false,
    startTime: "08:00",
    endTime: "17:00",
    tolerance: 15,
    maxBreak: 90,
    autoRegister: false,
    requireApproval: true,
    adminPhone: "",
    twoFactor: false,
    locationVerify: false,
    auditLog: true,
    backupEnable: true,
  });

  const { data: settings = [], isLoading } = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
  });

  // Load settings into form when data is available
  useEffect(() => {
    if (settings.length > 0) {
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, string>);

      setFormData({
        companyName: settingsMap.companyName || "",
        workHours: parseInt(settingsMap.workHours) || 8,
        lunchTime: parseInt(settingsMap.lunchTime) || 60,
        weekendWork: settingsMap.weekendWork === "true",
        lateArrival: settingsMap.lateArrival !== "false",
        missingCheckout: settingsMap.missingCheckout !== "false",
        longBreaks: settingsMap.longBreaks !== "false",
        dailySummary: settingsMap.dailySummary === "true",
        startTime: settingsMap.startTime || "08:00",
        endTime: settingsMap.endTime || "17:00",
        tolerance: parseInt(settingsMap.tolerance) || 15,
        maxBreak: parseInt(settingsMap.maxBreak) || 90,
        autoRegister: settingsMap.autoRegister === "true",
        requireApproval: settingsMap.requireApproval !== "false",
        adminPhone: settingsMap.adminPhone || "",
        twoFactor: settingsMap.twoFactor === "true",
        locationVerify: settingsMap.locationVerify === "true",
        auditLog: settingsMap.auditLog !== "false",
        backupEnable: settingsMap.backupEnable !== "false",
      });
    }
  }, [settings]);

  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: any[]) => {
      const response = await apiRequest("POST", "/api/settings", { settings });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const settingsToSave = [
      { key: "companyName", value: formData.companyName, type: "string" },
      { key: "workHours", value: formData.workHours.toString(), type: "number" },
      { key: "lunchTime", value: formData.lunchTime.toString(), type: "number" },
      { key: "weekendWork", value: formData.weekendWork.toString(), type: "boolean" },
      { key: "lateArrival", value: formData.lateArrival.toString(), type: "boolean" },
      { key: "missingCheckout", value: formData.missingCheckout.toString(), type: "boolean" },
      { key: "longBreaks", value: formData.longBreaks.toString(), type: "boolean" },
      { key: "dailySummary", value: formData.dailySummary.toString(), type: "boolean" },
      { key: "startTime", value: formData.startTime, type: "string" },
      { key: "endTime", value: formData.endTime, type: "string" },
      { key: "tolerance", value: formData.tolerance.toString(), type: "number" },
      { key: "maxBreak", value: formData.maxBreak.toString(), type: "number" },
      { key: "autoRegister", value: formData.autoRegister.toString(), type: "boolean" },
      { key: "requireApproval", value: formData.requireApproval.toString(), type: "boolean" },
      { key: "adminPhone", value: formData.adminPhone, type: "string" },
      { key: "twoFactor", value: formData.twoFactor.toString(), type: "boolean" },
      { key: "locationVerify", value: formData.locationVerify.toString(), type: "boolean" },
      { key: "auditLog", value: formData.auditLog.toString(), type: "boolean" },
      { key: "backupEnable", value: formData.backupEnable.toString(), type: "boolean" },
    ];

    saveSettingsMutation.mutate(settingsToSave);
  };
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Configurações</h2>
              <p className="text-gray-600 mt-1">Configurar o sistema de controle de ponto</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <SettingsIcon className="mr-2 h-5 w-5" />
                Configurações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company-name">Nome da Empresa</Label>
                <Input 
                  id="company-name" 
                  placeholder="Digite o nome da empresa"
                  value={formData.companyName}
                  onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="work-hours">Carga Horária Diária (horas)</Label>
                <Input 
                  id="work-hours" 
                  type="number" 
                  placeholder="8"
                  value={formData.workHours}
                  onChange={(e) => setFormData({...formData, workHours: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="lunch-time">Tempo de Almoço (minutos)</Label>
                <Input 
                  id="lunch-time" 
                  type="number" 
                  placeholder="60"
                  value={formData.lunchTime}
                  onChange={(e) => setFormData({...formData, lunchTime: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="weekend-work"
                  checked={formData.weekendWork}
                  onCheckedChange={(checked) => setFormData({...formData, weekendWork: checked})}
                />
                <Label htmlFor="weekend-work">Permitir trabalho nos fins de semana</Label>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="late-arrival"
                  checked={formData.lateArrival}
                  onCheckedChange={(checked) => setFormData({...formData, lateArrival: checked})}
                />
                <Label htmlFor="late-arrival">Notificar atrasos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="missing-checkout"
                  checked={formData.missingCheckout}
                  onCheckedChange={(checked) => setFormData({...formData, missingCheckout: checked})}
                />
                <Label htmlFor="missing-checkout">Notificar saídas não registradas</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="long-breaks"
                  checked={formData.longBreaks}
                  onCheckedChange={(checked) => setFormData({...formData, longBreaks: checked})}
                />
                <Label htmlFor="long-breaks">Notificar pausas longas</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="daily-summary"
                  checked={formData.dailySummary}
                  onCheckedChange={(checked) => setFormData({...formData, dailySummary: checked})}
                />
                <Label htmlFor="daily-summary">Resumo diário por email</Label>
              </div>
            </CardContent>
          </Card>

          {/* Time Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Horários
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="start-time">Horário de Início</Label>
                <Input 
                  id="start-time" 
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="end-time">Horário de Término</Label>
                <Input 
                  id="end-time" 
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="tolerance">Tolerância de Atraso (minutos)</Label>
                <Input 
                  id="tolerance" 
                  type="number" 
                  placeholder="15"
                  value={formData.tolerance}
                  onChange={(e) => setFormData({...formData, tolerance: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="max-break">Tempo Máximo de Pausa (minutos)</Label>
                <Input 
                  id="max-break" 
                  type="number" 
                  placeholder="90"
                  value={formData.maxBreak}
                  onChange={(e) => setFormData({...formData, maxBreak: parseInt(e.target.value) || 0})}
                />
              </div>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Gerenciamento de Usuários
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="auto-register"
                  checked={formData.autoRegister}
                  onCheckedChange={(checked) => setFormData({...formData, autoRegister: checked})}
                />
                <Label htmlFor="auto-register">Registro automático de novos funcionários</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="require-approval"
                  checked={formData.requireApproval}
                  onCheckedChange={(checked) => setFormData({...formData, requireApproval: checked})}
                />
                <Label htmlFor="require-approval">Exigir aprovação para novos registros</Label>
              </div>
              <div>
                <Label htmlFor="admin-phone">Telefone do Administrador</Label>
                <Input 
                  id="admin-phone" 
                  placeholder="+5511999999999"
                  value={formData.adminPhone}
                  onChange={(e) => setFormData({...formData, adminPhone: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Settings */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="two-factor"
                  checked={formData.twoFactor}
                  onCheckedChange={(checked) => setFormData({...formData, twoFactor: checked})}
                />
                <Label htmlFor="two-factor">Autenticação de dois fatores</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="location-verify"
                  checked={formData.locationVerify}
                  onCheckedChange={(checked) => setFormData({...formData, locationVerify: checked})}
                />
                <Label htmlFor="location-verify">Verificação de localização</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="audit-log"
                  checked={formData.auditLog}
                  onCheckedChange={(checked) => setFormData({...formData, auditLog: checked})}
                />
                <Label htmlFor="audit-log">Log de auditoria</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="backup-enable"
                  checked={formData.backupEnable}
                  onCheckedChange={(checked) => setFormData({...formData, backupEnable: checked})}
                />
                <Label htmlFor="backup-enable">Backup automático</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button 
            size="lg"
            onClick={handleSave}
            disabled={saveSettingsMutation.isPending || isLoading}
          >
            {saveSettingsMutation.isPending ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </main>
    </div>
  );
}
