import { exec, spawn } from 'child_process';
import ngrok from 'ngrok';
import readline from 'readline';

async function checkNgrokModule() {
    try {
        await import('ngrok');
        return true;
    } catch {
        return false;
    }
}

async function setupLocal() {
    console.log('🎯 WhatsApp Time Tracker - Setup Local');
    console.log('=====================================\n');
    console.log('🚀 Configurando ambiente local para WhatsApp...\n');

    const ngrokAvailable = await checkNgrokModule();
    if (!ngrokAvailable) {
        console.log('❌ Módulo ngrok não encontrado!');
        console.log('📦 Instalando ngrok (local)...');

        return new Promise((resolve) => {
            const installProcess = spawn('npm', ['install', 'ngrok'], {
                stdio: 'inherit'
            });

            installProcess.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ ngrok instalado localmente com sucesso!');
                    startNgrok();
                } else {
                    console.log('❌ Erro ao instalar ngrok');
                    console.log('💡 Tente instalar manualmente: npm install ngrok');
                }
            });
        });
    }

    startNgrok();
}

async function startNgrok() {
    console.log('🌐 Iniciando túnel ngrok na porta 5000...');

    const ngrokAuthToken = '2z3UTuVoqaG0hlm9ZNJGFYe0Lc5_29baNvjBEMXQ72eww8pS1'; // Use seu token

    try {
        await ngrok.authtoken(ngrokAuthToken);
        const url = await ngrok.connect(5000);

        console.log('✅ Túnel ngrok iniciado!');
        console.log('\n🎉 CONFIGURAÇÃO COMPLETA!');
        console.log('╔══════════════════════════════════════════════════════╗');
        console.log('║                    WEBHOOK URL                       ║');
        console.log('╠══════════════════════════════════════════════════════╣');
        console.log(`║ ${url}/api/whatsapp/webhook`);
        console.log('╚══════════════════════════════════════════════════════╝');
        console.log('\n📋 PRÓXIMOS PASSOS:');
        console.log('1. 🖥️  Abra outro terminal e rode: npm run dev');
        console.log('2. 🔗 Configure o webhook no Z-API com a URL acima');

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        console.log('\n⏸️  Pressione ENTER para parar o túnel ngrok...');
        rl.on('line', async () => {
            console.log('🛑 Parando ngrok...');
            await ngrok.disconnect();
            await ngrok.kill();
            rl.close();
            process.exit();
        });

        process.on('SIGINT', async () => {
            console.log('\n🛑 Parando ngrok...');
            await ngrok.disconnect();
            await ngrok.kill();
            process.exit();
        });

    } catch (err) {
        console.error('❌ Erro ao iniciar ngrok:', err.message);
        process.exit(1);
    }
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
🎯 WhatsApp Time Tracker - Setup Local
=====================================

USO:
  node setup-local.js          # Configurar ambiente local
  node setup-local.js --help   # Mostrar esta ajuda

FUNCIONALIDADES:
  ✅ Instala ngrok automaticamente se necessário
  ✅ Cria túnel público para porta 5000
  ✅ Mostra URL para configurar no Z-API
  ✅ Instruções passo a passo

DEPOIS DE EXECUTAR:
  1. Copie a URL do webhook mostrada
  2. Configure no Z-API: https://z-api.io
  3. Rode seu projeto: npm run dev
  4. Teste com WhatsApp!

COMANDOS SUPORTADOS:
  • entrada - Registra entrada
  • saida - Registra saída  
  • pausa - Inicia pausa
  • volta - Volta da pausa
`);
    process.exit(0);
}

setupLocal();
