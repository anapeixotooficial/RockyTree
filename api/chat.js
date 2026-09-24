/**
 * ============================================================================
 * VERCEL SERVERLESS FUNCTION - /api/chat
 * ============================================================================
 * Executado no BACKEND (Node.js) pela Vercel.
 * A chave GROQ_API_KEY fica 100% protegida no servidor e NUNCA é enviada
 * para o navegador do visitante.
 * ============================================================================
 */

async function handler(req, res) {
    // Configurar headers de CORS universais para permitir requisições seguras
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // Tratamento de preflight CORS (OPTIONS)
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // Permitir apenas requisições POST
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido" });
    }

    // Leitura da chave secreta configurada no painel da Vercel (Environment Variables)
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        console.warn("TreeBot API: GROQ_API_KEY não foi encontrada nas Environment Variables da Vercel.");
        return res.status(500).json({
            error: "GROQ_API_KEY não configurada no painel da Vercel."
        });
    }

    try {
        // Garantir leitura do corpo como JSON mesmo se vier como string
        let body = req.body;
        if (typeof body === "string") {
            try {
                body = JSON.parse(body);
            } catch (_) {}
        }
        const { messages = [] } = body || {};

        // Prompt de sistema focado em resposta técnica, natural e de alta conversão
        const systemPrompt = {
            role: "system",
            content: `Você é o TreeBot 🌲, assistente virtual da Rocky Tree Technologies (fundada por Ana Peixoto e Mikaell Rocha em Santo Antônio de Jesus - BA).
Responda de forma direta, técnica, simpática e objetiva (máximo 2 a 3 frases).
Esclareça as dúvidas sobre Desenvolvimento Web/Landing Pages, Infraestrutura de Redes, Hardware/PC Gamer e Design de Marcas com naturalidade.
Converse normalmente com o usuário. Só sugira ou direcione para o WhatsApp quando for realmente necessário (por exemplo, quando o cliente pedir orçamento formal, demonstrar intenção de fechar negócio ou solicitar contato humano direto).`
        };

        // Chamada confidencial para a Groq (oculta no backend)
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [systemPrompt, ...messages.slice(-6)],
                temperature: 0.5,
                max_tokens: 250
            })
        });

        if (!response.ok) {
            const errData = await response.text();
            console.error("Erro da Groq API:", errData);
            return res.status(response.status).json({
                error: "Falha na comunicação com o provedor de IA"
            });
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || "Como posso ajudar com o seu projeto?";

        // Devolve apenas o texto limpo para o frontend
        return res.status(200).json({ reply });

    } catch (error) {
        console.error("Erro interno no /api/chat:", error);
        return res.status(500).json({ error: "Erro interno no servidor" });
    }
}

// Compatibilidade dupla (CommonJS e ES Modules) para qualquer versão de Node na Vercel
module.exports = handler;
module.exports.default = handler;
