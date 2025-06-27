import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AttendanceRecord, Employee } from "@shared/schema";
import { formatDateTime } from "@/lib/utils";
import { Calendar, Clock, Search } from "lucide-react";
import { useState } from "react";

export default function TimeRecords() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const { data: records = [], isLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ["/api/attendance"],
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const getEmployeeName = (employeeId: number) => {
    return employees.find(emp => emp.id === employeeId)?.name || "Funcionário não encontrado";
  };

  const getActionBadge = (type: string) => {
    const badges = {
      entrada: { label: "Entrada", className: "bg-green-100 text-green-800" },
      saida: { label: "Saída", className: "bg-red-100 text-red-800" },
      pausa: { label: "Pausa", className: "bg-yellow-100 text-yellow-800" },
      volta: { label: "Volta", className: "bg-blue-100 text-blue-800" },
    };
    
    return badges[type as keyof typeof badges] || { label: type, className: "bg-gray-100 text-gray-800" };
  };

  const filteredRecords = records.filter(record => {
    const employeeName = getEmployeeName(record.employeeId).toLowerCase();
    const matchesSearch = searchTerm === "" || employeeName.includes(searchTerm.toLowerCase());
    const matchesDate = selectedDate === "" || record.timestamp.toString().includes(selectedDate);
    return matchesSearch && matchesDate;
  });

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Registros de Ponto</h2>
              <p className="text-gray-600 mt-1">Histórico de entradas, saídas e pausas</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="mr-2 h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar funcionário
                </label>
                <Input
                  placeholder="Nome do funcionário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedDate("");
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Records Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Registros Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                    <div className="w-20 h-6 bg-gray-200 rounded"></div>
                    <div className="w-32 h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredRecords.map((record) => {
                  const badge = getActionBadge(record.type);
                  return (
                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {getEmployeeName(record.employeeId).split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {getEmployeeName(record.employeeId)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.message}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className={badge.className}>
                          {badge.label}
                        </Badge>
                        <div className="text-sm text-gray-500 min-w-0 flex-shrink-0">
                          {formatDateTime(record.timestamp)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredRecords.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum registro encontrado
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
