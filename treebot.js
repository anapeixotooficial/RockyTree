/**
 * ============================================================================
 * TREEBOT IA 3.0 - ASSISTENTE VIRTUAL ROCKY TREE TECHNOLOGIES
 * ============================================================================
 * Design Tech Minimalist, Dark UI com acentos Neon.
 * Suporte a proxy confidencial (Groq) e motor local de conhecimento integrado
 * para alta conversão e sigilo total da chave de API.
 * ============================================================================
 */

const TREEBOT_CONFIG = {
    // Endpoint backend seguro (/api/chat via Vercel Serverless Function).
    // A chave secreta GROQ_API_KEY fica 100% no servidor da Vercel, nunca visível ao navegador.
    API_ENDPOINT: window.ROCKY_TREE_CONFIG?.apiEndpoint || "/api/chat",
    WHATSAPP_NUMBER: "5575998729593",
    FOUNDERS: "Ana Peixoto e Mikaell Rocha",
    LOCATION: "Santo Antônio de Jesus - BA (Atendimento Presencial e 100% Remoto para todo o Brasil)"
};

// Prompt de sistema base (utilizado quando conectado ao backend de IA)
const TREEBOT_SYSTEM_PROMPT = `Você é o TreeBot 🌲, assistente virtual da Rocky Tree Technologies.
Seu objetivo é ser simpático, direto ao ponto e técnico-minimalista. Esclareça dúvidas sobre os serviços da empresa com concisão (máximo 2 a 3 frases).
Converse com naturalidade com o usuário. Só encaminhe ou sugira contato no WhatsApp quando for realmente necessário (ex: pedido de orçamento formal, intenção de fechar negócio ou solicitação de contato humano direto).`;

// Histórico de mensagens do chat
let treebotMessages = [
    { role: "system", content: TREEBOT_SYSTEM_PROMPT }
];
let treebotWaiting = false;

// Base de conhecimento local instantânea (Garante 100% de funcionamento offline/resiliente)
const TREEBOT_KNOWLEDGE_BASE = [
    {
        keywords: ["landing page", "site", "criar site", "pagina", "desenvolvimento web", "preco site", "quanto custa um site", "loja virtual", "one page"],
        reply: "Desenvolvemos **Landing Pages de alta conversão** (entre **R$ 400 e R$ 800**, com 50% OFF de lançamento!) e **Sites Institucionais completos** (de **R$ 1.800 a R$ 2.800**). 🚀\n\nQual é o objetivo principal do seu novo projeto?"
    },
    {
        keywords: ["suporte", "suporte ti", "redes", "servidor", "chamado", "manutencao", "plano mensal", "contrato ti", "ti para empresas"],
        reply: "Oferecemos **Chamados Avulsos** (R$ 120 a R$ 180) e **Planos Mensais de Suporte de TI** a partir de **R$ 350/mês** para empresas, com SLA prioritário e gestão completa da infraestrutura. Você precisa de atendimento pontual ou mensal?"
    },
    {
        keywords: ["pc gamer", "hardware", "formatacao", "formatar", "limpeza", "pasta termica", "microsolda", "placa", "reparo", "montagem", "workstation"],
        reply: "Fazemos montagem especializada de **PC Gamer e Workstations** (mão de obra R$ 200 a R$ 350), formatação limpa (R$ 100 a R$ 150), limpeza técnica com troca de pasta térmica e reparos em placas eletrônicas."
    },
    {
        keywords: ["design", "logo", "logotipo", "identidade visual", "artes", "redes sociais", "branding", "marca", "manual da marca"],
        reply: "Criamos **Logotipos profissionais** (R$ 150 a R$ 200), **Identidade Visual completa** (R$ 200 a R$ 500) e pacotes mensais de artes para redes sociais a partir de R$ 150/mês. Você já tem uma ideia em mente?"
    },
    {
        keywords: ["quem sao", "fundador", "fundadores", "donos", "criadores", "ana", "mikaell", "sobre", "historia"],
        reply: "A Rocky Tree Technologies foi fundada por **Ana Peixoto** e **Mikaell Rocha**, especialistas em Redes, Infraestrutura e Desenvolvimento. Nosso foco é entregar soluções sólidas do hardware à nuvem."
    },
    {
        keywords: ["onde ficam", "endereco", "cidade", "local", "santo antonio", "saj", "remoto", "presencial", "bahia"],
        reply: "Nossa sede fica em **Santo Antônio de Jesus - BA**, onde realizamos atendimentos presenciais, e atendemos projetos de Desenvolvimento Web e Consultoria **100% de forma remota para todo o Brasil**."
    },
    {
        keywords: ["whatsapp", "zap", "whats", "contato", "telefone", "falar", "humano", "atendente", "orcamento", "cotacao", "fechar", "contratar", "agendar", "conversar"],
        reply: "Com certeza! Para formalizar seu orçamento ou falar diretamente com a Ana Peixoto e o Mikaell Rocha, você pode nos chamar no WhatsApp:",
        directToWhatsApp: true,
        cta: "Olá, equipe Rocky Tree! Estava conversando com o TreeBot e gostaria de solicitar um orçamento / agendar atendimento."
    }
];

// Event Listeners globais
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
        if (iconOpen) {
            iconOpen.classList.add("hidden");
            iconOpen.classList.remove("block");
        }
        if (iconClose) {
            iconClose.classList.remove("hidden");
            iconClose.classList.add("block");
        }
        const input = document.getElementById("treebot-input");
        if (input) input.focus();
    } else {
        chatWindow.classList.add("hidden");
        chatWindow.classList.remove("flex");
        if (iconOpen) {
            iconOpen.classList.remove("hidden");
            iconOpen.classList.add("block");
        }
        if (iconClose) {
            iconClose.classList.add("hidden");
            iconClose.classList.remove("block");
        }
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
        <div class="self-end bg-[#ccff00] text-[#06080c] font-semibold rounded-2xl rounded-tr-xs px-4 py-2.5 max-w-[85%] text-xs md:text-sm shadow-[0_0_15px_rgba(204,255,0,0.15)] animate-[fadeIn_0.2s_ease-out]">
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
        <div class="bg-[#111622] border border-white/10 rounded-2xl rounded-tl-xs p-3.5 text-gray-200 max-w-[90%] shadow-lg text-xs md:text-sm animate-[fadeIn_0.2s_ease-out] space-y-2.5">
            <div class="leading-relaxed">${formatted}</div>
            ${extraHtml}
        </div>
    `;
    msgs.scrollTop = msgs.scrollHeight;
}

function showTreebotTyping() {
    const msgs = document.getElementById("chat-messages");
    if (!msgs) return;
    msgs.innerHTML += `
        <div id="treebot-typing" class="bg-[#111622] border border-white/10 rounded-2xl rounded-tl-xs px-3.5 py-2.5 text-[#ccff00] max-w-[65%] shadow-sm flex items-center gap-1.5 text-xs">
            <span class="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-bounce"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-bounce [animation-delay:0.15s]"></span>
            <span class="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-bounce [animation-delay:0.3s]"></span>
            <span class="text-[11px] text-gray-400 ml-1.5 font-medium">Digitando...</span>
        </div>
    `;
    msgs.scrollTop = msgs.scrollHeight;
}

function hideTreebotTyping() {
    const indicator = document.getElementById("treebot-typing");
    if (indicator) indicator.remove();
}

/**
 * Resolução inteligente de resposta por pontuação de intenção
 */
function findBestLocalKnowledgeMatch(query) {
    const cleanQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    let bestMatch = null;
    let maxScore = 0;

    for (const item of TREEBOT_KNOWLEDGE_BASE) {
        let score = 0;
        for (const kw of item.keywords) {
            const cleanKw = kw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (cleanQuery.includes(cleanKw)) {
                score += cleanKw.length >= 8 ? 4 : (cleanKw.length >= 4 ? 2 : 1);
            }
        }
        if (score > maxScore) {
            maxScore = score;
            bestMatch = item;
        }
    }
    return maxScore > 0 ? bestMatch : null;
}

/**
 * Envia mensagem ao assistente com sigilo e fail-safe local
 */
async function sendTreebotMessage(userText) {
    appendTreebotUserMsg(userText);
    treebotMessages.push({ role: "user", content: userText });

    treebotWaiting = true;
    showTreebotTyping();

    let aiReply = null;
    let customCta = null;

    // Tentativa de consulta via Backend Vercel Serverless Function (/api/chat)
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

        const response = await fetch(TREEBOT_CONFIG.API_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: treebotMessages.slice(-6)
            }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            aiReply = data.reply || data.choices?.[0]?.message?.content || null;
        }
    } catch {
        // Falha de rede ou proxy não configurado - ativa mecanismo resiliente sem expor erros
    }

    let matchedItem = null;

    // Se o backend remoto não responder, usa o motor local de respostas imediatas
    if (!aiReply) {
        matchedItem = findBestLocalKnowledgeMatch(userText);
        if (matchedItem) {
            aiReply = matchedItem.reply;
        } else {
            aiReply = "Posso esclarecer suas dúvidas sobre **Desenvolvimento Web**, **Suporte de TI & Redes**, **Montagem/Reparo de Hardware** ou **Design Gráfico**. Como podemos te ajudar?";
        }
    }

    treebotMessages.push({ role: "assistant", content: aiReply });
    hideTreebotTyping();
    treebotWaiting = false;

    // Só gera a ação de WhatsApp caso seja realmente oportuno/necessário
    const extraBtn = getTreebotWhatsAppButton(aiReply, userText, matchedItem);
    appendTreebotBotMsg(aiReply, extraBtn);
}

/**
 * Avalia se o contexto exige o direcionamento para o WhatsApp
 */
function getTreebotWhatsAppButton(aiText, userText, matchedItem) {
    const combined = (userText + " " + aiText).toLowerCase();

    // Palavras que indicam necessidade real de transição para atendimento humano/WhatsApp
    const handoffTriggers = [
        "whatsapp", "zap", "whats", "telefone", "contato", "falar com",
        "atendente", "humano", "orcamento", "orçamento", "cotacao", "cotação",
        "fechar", "contratar", "agendar", "proposta", "comprar", "preco final",
        "preço final", "chamar no", "direto no whatsapp", "abrir conversa", "fechar projeto"
    ];

    const isHandoverTriggered = handoffTriggers.some(trigger => combined.includes(trigger));
    const isDirectHandoff = matchedItem?.directToWhatsApp === true;

    // Se não for necessário, NÃO exibe nenhum botão
    if (!isHandoverTriggered && !isDirectHandoff) {
        return "";
    }

    const defaultMsg = matchedItem?.cta || `Olá, Rocky Tree! Conversei com o TreeBot sobre "${userText}" e gostaria de continuar o atendimento.`;
    return renderWhatsAppCallToAction(defaultMsg);
}

/**
 * Renderiza um botão de ação elegante, discreto e minimalista
 */
function renderWhatsAppCallToAction(msg) {
    const encoded = encodeURIComponent(msg);
    return `
        <div class="pt-2">
            <a href="https://wa.me/${TREEBOT_CONFIG.WHATSAPP_NUMBER}?text=${encoded}" target="_blank" 
               class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ccff00]/10 hover:bg-[#ccff00] border border-[#ccff00]/30 hover:border-[#ccff00] text-[#ccff00] hover:text-[#06080c] font-semibold rounded-lg text-xs transition-all duration-200 shadow-sm">
                <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.124.557 4.122 1.54 5.874l-1.636 5.975 6.115-1.604c1.691.92 3.619 1.447 5.981 1.447 6.627 0 12-5.373 12-12s-5.373-12-12-12z"/></svg>
                <span>Falar no WhatsApp</span>
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </a>
        </div>
    `;
}

function formatTreebotMarkdown(text) {
    let html = escapeTreebotHtml(text);
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
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
    return String(text).replace(/[&<>"']/g, (m) => map[m]);
}
