import { LogIn, LogOut, Pause, Play } from "lucide-react";

const commands = [
  {
    command: "entrada",
    description: "Registrar entrada",
    icon: LogIn,
    bgColor: "bg-green-500",
  },
  {
    command: "saida",
    description: "Registrar saída",
    icon: LogOut,
    bgColor: "bg-red-500",
  },
  {
    command: "pausa",
    description: "Iniciar pausa",
    icon: Pause,
    bgColor: "bg-yellow-500",
  },
  {
    command: "volta",
    description: "Voltar da pausa",
    icon: Play,
    bgColor: "bg-blue-500",
  },
];

export function WhatsAppCommands() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Comandos WhatsApp</h3>
      <div className="space-y-3">
        {commands.map((cmd) => {
          const Icon = cmd.icon;
          return (
            <div key={cmd.command} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-8 h-8 ${cmd.bgColor} rounded-full flex items-center justify-center`}>
                <Icon className="text-white text-xs" size={14} />
              </div>
              <div>
                <div className="font-medium text-gray-900">{cmd.command}</div>
                <div className="text-sm text-gray-500">{cmd.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
