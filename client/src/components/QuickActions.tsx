import { UserPlus, Download, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuickActions() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
      <div className="space-y-3">
        <Button className="w-full justify-center" size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Adicionar Funcionário
        </Button>
        <Button variant="outline" className="w-full justify-center" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
        <Button variant="outline" className="w-full justify-center" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Configurar WhatsApp
        </Button>
      </div>
    </div>
  );
}
