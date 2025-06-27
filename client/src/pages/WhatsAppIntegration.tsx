import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MessageSquare, Send, TestTube, Settings, CheckCircle } from "lucide-react";

export default function WhatsAppIntegration() {
    const [testPhone, setTestPhone] = useState("");
    const [testMessage, setTestMessage] = useState("");
    const { toast } = useToast();

    const testMessageMutation = useMutation({
        mutationFn: async (data: { phone: string; message: string }) => {
            const response = await apiRequest("POST", "/api/whatsapp/simulate", data);
            return response.json();
        },
        onSuccess: (data) => {
            toast({
                title: "Teste realizado com sucesso",
                description: `Resposta: ${data.response}`,
            });
            setTestMessage("");
        },
        onError: () => {
            toast({
                title: "Erro no teste",
                description: "Não foi possível processar a mensagem de teste.",
                variant: "destructive",
            });
        },
    });

    const handleTestMessage = () => {
        if (!testPhone || !testMessage) {
            toast({
                title: "Campos obrigatórios",
                description: "Preencha o telefone e a mensagem para testar.",
                variant: "destructive",
            });
            return;
        }
        testMessageMutation.mutate({ phone: testPhone, message: testMessage });
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            <Sidebar />

            <main className="flex-1 p-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Integração WhatsApp</h2>
                            <p className="text-gray-600 mt-1">Configurar e testar a integração com WhatsApp</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Conectado
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* WhatsApp Configuration */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Settings className="mr-2 h-5 w-5" />
                                Configuração
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Webhook URL (Z-API)
                                </label>
                                <Input
                                    value="https://108b-89-153-139-43.ngrok-free.app/api/whatsapp/webhook"
                                    readOnly
                                    className="bg-gray-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Instância Z-API
                                </label>
                                <Input
                                    value="Advir (3E34A6DE...)"
                                    readOnly
                                    className="bg-gray-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status da Conexão
                                </label>
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-green-600 font-medium">Conectado e funcionando</span>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full">
                                <Settings className="mr-2 h-4 w-4" />
                                Reconfigurar Webhook
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Test Messages */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <TestTube className="mr-2 h-5 w-5" />
                                Testar Mensagens
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Número de Telefone
                                </label>
                                <Input
                                    placeholder="+5511999999999"
                                    value={testPhone}
                                    onChange={(e) => setTestPhone(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mensagem de Teste
                                </label>
                                <Textarea
                                    placeholder="Digite um comando (entrada, saida, pausa, volta)"
                                    value={testMessage}
                                    onChange={(e) => setTestMessage(e.target.value)}
                                    rows={3}
                                />
                            </div>
                            <Button
                                onClick={handleTestMessage}
                                disabled={testMessageMutation.isPending}
                                className="w-full"
                            >
                                <Send className="mr-2 h-4 w-4" />
                                {testMessageMutation.isPending ? "Enviando..." : "Enviar Teste"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Commands Guide */}
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <MessageSquare className="mr-2 h-5 w-5" />
                            Guia de Comandos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Comandos Básicos</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <span className="font-mono text-sm bg-white px-2 py-1 rounded">entrada</span>
                                            <p className="text-sm text-gray-600 mt-1">Registra entrada no trabalho</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <span className="font-mono text-sm bg-white px-2 py-1 rounded">saida</span>
                                            <p className="text-sm text-gray-600 mt-1">Registra saída do trabalho</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <span className="font-mono text-sm bg-white px-2 py-1 rounded">pausa</span>
                                            <p className="text-sm text-gray-600 mt-1">Inicia pausa/intervalo</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <span className="font-mono text-sm bg-white px-2 py-1 rounded">volta</span>
                                            <p className="text-sm text-gray-600 mt-1">Retorna da pausa</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3">Exemplos de Uso</h4>
                                <div className="space-y-3">
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            <strong>Funcionário:</strong> "entrada"
                                        </p>
                                        <p className="text-sm text-blue-600 mt-1">
                                            <strong>Sistema:</strong> "✅ Entrada registrada com sucesso! ⏰ Horário: 08:30"
                                        </p>
                                    </div>
                                    <div className="p-3 bg-yellow-50 rounded-lg">
                                        <p className="text-sm text-yellow-800">
                                            <strong>Funcionário:</strong> "pausa"
                                        </p>
                                        <p className="text-sm text-yellow-600 mt-1">
                                            <strong>Sistema:</strong> "⏸️ Pausa iniciada! ⏰ Horário: 12:00"
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <p className="text-sm text-green-800">
                                            <strong>Funcionário:</strong> "volta"
                                        </p>
                                        <p className="text-sm text-green-600 mt-1">
                                            <strong>Sistema:</strong> "▶️ Volta da pausa registrada! ⏰ Horário: 13:00"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
