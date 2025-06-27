import { useQuery } from "@tanstack/react-query";
import type { WhatsappMessage } from "@shared/schema";
import { formatTime } from "@/lib/utils";

export function RecentMessages() {
  const { data: messages = [], isLoading } = useQuery<WhatsappMessage[]>({
    queryKey: ["/api/whatsapp/messages"],
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mensagens Recentes</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Mensagens Recentes</h3>
      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-700">
                {message.phone.slice(-2)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">
                  {message.phone}
                </p>
                <p className="text-xs text-gray-500">
                  {formatTime(message.timestamp)}
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-gray-600">{message.command || message.message}</span>
                <span className={`w-2 h-2 rounded-full ${message.processed ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                <span className={`text-xs ${message.processed ? 'text-green-500' : 'text-yellow-500'}`}>
                  {message.processed ? 'Processado' : 'Pendente'}
                </span>
              </div>
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <p className="text-gray-500 text-center py-4">Nenhuma mensagem recente</p>
        )}
      </div>
      <button className="w-full mt-4 text-primary hover:text-blue-700 text-sm font-medium">
        Ver todas as mensagens
      </button>
    </div>
  );
}
