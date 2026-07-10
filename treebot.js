/**
 * ============================================================================
 * TREEBOT 2.0 - ASSISTENTE IA DA ROCKY TREE TECHNOLOGIES
 * ============================================================================
 * Lógica conversacional direta ao ponto, amigável e focada em conversão rápida.
 * Conectado à Groq API (Llama 3.3 70B).
 * ============================================================================
 */

const TREEBOT_CONFIG = {
    // Chave secreta está 100% oculta e protegida no backend da VPS em Roma (/var/www/backend/.env)
    API_URL: "http://46.254.38.213/api/treebot-chat",
    GROQ_MODEL: "llama-3.3-70b-versatile",
    WHATSAPP_NUMBER: "5575999999999"
};

// SYSTEM PROMPT DIRETÍSSIMO AO PONTO E AMIGÁVEL
const TREEBOT_SYSTEM_PROMPT = `Você é o TreeBot 🌲, o assistente virtual de Inteligência Artificial da Rocky Tree Technologies.
Seu objetivo é ser EXTREMAMENTE SIMPÁTICO, DIRETO AO PONTO e FOCADO EM MARCAÇÃO RÁPIDA (encaminhar o lead para o WhatsApp da Ana Peixoto e do Mikaell Rocha).

REGRA DE OURO #1 - SEJA CONCISO (MÁXIMO 2 A 3 FRASES POR RESPOSTA):
- NUNCA escreva textos longos, parágrafos extensos ou rodeios. Em um chat, respostas longas afastam o cliente.
- Vá direto ao ponto: responda a dúvida ou preço com clareza e faça no máximo UMA pergunta curta para avançar o atendimento.

REGRA DE OURO #2 - CONDUZA AO WHATSAPP EM ATÉ 2 OU 3 TROCAS:
- Assim que o cliente demonstrar interesse, pedir orçamento ou quiser fechar, gere o resumo e incentive-o a clicar no botão de WhatsApp.

=== INFORMAÇÕES ESSENCIAIS DA ROCKY TREE ===
- Fundadores: Ana Peixoto e Mikaell Rocha.
- Sede: Santo Antônio de Jesus (BA) — atendimento presencial na região de SAJ e 100% REMOTO para todo o Brasil.
- Tabela de Preços (Seja direto):
  • Landing Page / Site Único: R$ 400 a R$ 800 (50% OFF para os primeiros clientes no lançamento!).
  • Site Institucional Completo: R$ 1.800 a R$ 2.800.
  • Manutenção de Sites: R$ 150 a R$ 250/mês.
  • Montagem PC Gamer / Workstation: Mão de obra R$ 200 a R$ 350.
  • Suporte Técnico de TI (Mensal): R$ 350 a R$ 900/mês.
  • Identidade Visual & Logos: R$ 150 a R$ 500.

EXEMPLO DE TOM DESEJADO:
Cliente: "Quanto custa um site?"
TreeBot: "Uma Landing Page moderna em Dark Mode fica entre **R$ 400 e R$ 800** (com 50% OFF de lançamento!), e um Site Institucional Completo entre **R$ 1.800 e R$ 2.800**. 🚀\n\nVocê precisa para quando?"`;

let treebotMessages = [
    { role: "system", content: TREEBOT_SYSTEM_PROMPT }
];
let treebotWaiting = false;

// Event Listeners globais quando o DOM carregar
document.addEventListener("DOMContentLoaded", () => {
    const chatInput = document.getElementById("treebot-input");
    const sendBtn = document.getElementById("treebot-send-btn");

    if (chatInput && sendBtn) {
        chatInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleTreebotSend();
            }
        });

        sendBtn.addEventListener("click", () => {
            handleTreebotSend();
        });
    }
});

function toggleChat() {
    const chatWindow = document.getElementById("chatbot-window");
    const iconOpen = document.getElementById("chat-icon-open");
    const iconClose = document.getElementById("chat-icon-close");

    if (!chatWindow) return;

    if (chatWindow.classList.contains("hidden")) {
        chatWindow.classList.remove("hidden");
        chatWindow.classList.add("flex");
        iconOpen.classList.add("hidden");
        iconOpen.classList.remove("block");
        iconClose.classList.remove("hidden");
        iconClose.classList.add("block");
        const input = document.getElementById("treebot-input");
        if (input) input.focus();
    } else {
        chatWindow.classList.add("hidden");
        chatWindow.classList.remove("flex");
        iconOpen.classList.remove("hidden");
        iconOpen.classList.add("block");
        iconClose.classList.add("hidden");
        iconClose.classList.remove("block");
    }
}

function sendTreebotQuickMessage(text) {
    if (treebotWaiting) return;
    sendTreebotMessage(text);
}

function handleTreebotSend() {
    if (treebotWaiting) return;
    const input = document.getElementById("treebot-input");
    const text = input ? input.value.trim() : "";
    if (!text) return;
    input.value = "";
    sendTreebotMessage(text);
}

function appendTreebotUserMsg(text) {
    const msgs = document.getElementById("chat-messages");
    if (!msgs) return;
    msgs.innerHTML += `
        <div class="self-end bg-cyber-green text-cyber-dark rounded-2xl rounded-tr-sm px-3.5 py-2.5 max-w-[85%] font-medium shadow-sm text-xs md:text-sm animate-[fadeIn_0.2s_ease-out]">
            ${escapeTreebotHtml(text)}
        </div>
    `;
    msgs.scrollTop = msgs.scrollHeight;
}

function appendTreebotBotMsg(text, extraHtml = "") {
    const msgs = document.getElementById("chat-messages");
    if (!msgs) return;
    const formatted = formatTreebotMarkdown(text);
    msgs.innerHTML += `
        <div class="bg-cyber-gray/90 border border-white/10 rounded-2xl rounded-tl-sm p-3 text-gray-200 max-w-[90%] shadow-sm text-xs md:text-sm animate-[fadeIn_0.2s_ease-out] space-y-2">
            <div>${formatted}</div>
            ${extraHtml}
        </div>
    `;
    msgs.scrollTop = msgs.scrollHeight;
}

function showTreebotTyping() {
    const msgs = document.getElementById("chat-messages");
    if (!msgs) return;
    msgs.innerHTML += `
        <div id="treebot-typing" class="bg-cyber-gray/70 border border-white/10 rounded-2xl rounded-tl-sm px-3 py-2 text-cyber-green max-w-[65%] shadow-sm flex items-center gap-1.5 text-xs">
            <span class="w-1.5 h-1.5 rounded-full bg-cyber-green animate-bounce"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-cyber-green animate-bounce [animation-delay:0.15s]"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-cyber-green animate-bounce [animation-delay:0.3s]"></span>
            <span class="text-[11px] text-gray-400 ml-1">Digitando...</span>
        </div>
    `;
    msgs.scrollTop = msgs.scrollHeight;
}

function hideTreebotTyping() {
    const indicator = document.getElementById("treebot-typing");
    if (indicator) indicator.remove();
}

async function sendTreebotMessage(userText) {
    appendTreebotUserMsg(userText);
    treebotMessages.push({ role: "user", content: userText });

    treebotWaiting = true;
    showTreebotTyping();

    try {
        const response = await fetch(TREEBOT_CONFIG.API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: TREEBOT_CONFIG.GROQ_MODEL,
                messages: treebotMessages,
                temperature: 0.5, // Mais baixo para ser ainda mais preciso e conciso
                max_tokens: 250   // Limita tokens para garantir respostas curtas e rápidas
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const aiReply = data.choices?.[0]?.message?.content || "Como posso te ajudar com seu projeto?";
        
        treebotMessages.push({ role: "assistant", content: aiReply });
        hideTreebotTyping();
        treebotWaiting = false;

        const extraBtn = getTreebotWhatsAppButton(aiReply, userText);
        appendTreebotBotMsg(aiReply, extraBtn);

    } catch (error) {
        console.error("Erro TreeBot:", error);
        hideTreebotTyping();
        treebotWaiting = false;
        appendTreebotBotMsg(
            "Oi! Para um atendimento imediato com a Ana e o Mikaell, clique abaixo para abrir nosso WhatsApp oficial:",
            renderWhatsAppCallToAction("Olá! Gostaria de falar com a equipe da Rocky Tree.")
        );
    }
}

function getTreebotWhatsAppButton(aiText, userText) {
    const combined = (aiText + " " + userText).toLowerCase();
    if (combined.includes("whatsapp") || combined.includes("orçamento") || combined.includes("cotação") || combined.includes("contato") || combined.includes("falar com") || combined.includes("proposta")) {
        return renderWhatsAppCallToAction("Olá, Rocky Tree! Conversei com o TreeBot e gostaria de agendar/solicitar um orçamento.");
    }
    return "";
}

function renderWhatsAppCallToAction(msg) {
    const encoded = encodeURIComponent(msg);
    return `
        <div class="pt-1.5">
            <a href="https://wa.me/${TREEBOT_CONFIG.WHATSAPP_NUMBER}?text=${encoded}" target="_blank" 
               class="inline-flex items-center justify-center gap-1.5 w-full px-3.5 py-2 bg-cyber-green hover:bg-white text-cyber-dark font-bold rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(0,255,136,0.3)]">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.124.557 4.122 1.54 5.874l-1.636 5.975 6.115-1.604c1.691.92 3.619 1.447 5.981 1.447 6.627 0 12-5.373 12-12s-5.373-12-12-12z"/></svg>
                Falar Direto no WhatsApp
            </a>
        </div>
    `;
}

function formatTreebotMarkdown(text) {
    let html = escapeTreebotHtml(text);
    html = html.replace(/\*(.*?)\*/g, '<strong class="text-white font-semibold">$1</strong>');
    html = html.replace(/\n/g, '<br>');
    return html;
}

function escapeTreebotHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}
