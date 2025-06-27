import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { StatsCard } from "@/components/StatsCard";
import { EmployeeTable } from "@/components/EmployeeTable";
import { WhatsAppCommands } from "@/components/WhatsAppCommands";
import { RecentMessages } from "@/components/RecentMessages";
import { QuickActions } from "@/components/QuickActions";
import { Users, CheckCircle, Pause, MessageSquare } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface Stats {
  activeEmployees: number;
  presentToday: number;
  onBreak: number;
  messagesProcessed: number;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
              <p className="text-gray-600 mt-1">Visão geral do controle de ponto</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* WhatsApp Status */}
              <div className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="font-medium">WhatsApp Conectado</span>
              </div>
              <div className="text-sm text-gray-500">
                <span>{formatDateTime(new Date())}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Funcionários Ativos"
            value={statsLoading ? "..." : stats?.activeEmployees || 0}
            icon={Users}
            change="+2 esta semana"
            changeType="positive"
            bgColor="bg-primary"
          />
          <StatsCard
            title="Presentes Hoje"
            value={statsLoading ? "..." : stats?.presentToday || 0}
            icon={CheckCircle}
            subtitle={`${stats?.presentToday || 0}/${stats?.activeEmployees || 0} funcionários`}
            bgColor="bg-green-500"
          />
          <StatsCard
            title="Em Pausa"
            value={statsLoading ? "..." : stats?.onBreak || 0}
            icon={Pause}
            subtitle="Tempo médio: 25min"
            bgColor="bg-yellow-500"
          />
          <StatsCard
            title="Mensagens Hoje"
            value={statsLoading ? "..." : stats?.messagesProcessed || 0}
            icon={MessageSquare}
            change="+12% vs ontem"
            changeType="positive"
            bgColor="bg-purple-500"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Employee Status Table */}
          <div className="lg:col-span-2">
            <EmployeeTable />
          </div>

          {/* Right Sidebar Content */}
          <div className="space-y-6">
            <WhatsAppCommands />
            <RecentMessages />
            <QuickActions />
          </div>
        </div>
      </main>
    </div>
  );
}
