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

    // Leitura e sanitização da chave secreta configurada no painel da Vercel
    const rawKey = process.env.GROQ_API_KEY || process.env.groq_api_key || "";
    const apiKey = rawKey.trim().replace(/^["']|["']$/g, "");

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

        // Modelos candidatos na Groq (ordenados por prioridade e disponibilidade na API de desenvolvedor)
        // Nota: openai/gpt-oss-20b e openai/gpt-oss-120b são os modelos ativos de produção para desenvolvedores
        const candidateModels = [
            process.env.GROQ_MODEL,
            "openai/gpt-oss-20b",
            "openai/gpt-oss-120b",
            "llama-3.3-70b-versatile",
            "llama-3.1-8b-instant"
        ].filter(Boolean);

        let lastStatus = 500;
        let lastError = null;

        for (const model of candidateModels) {
            try {
                const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: model,
                        messages: [systemPrompt, ...messages.slice(-6)],
                        temperature: 0.5,
                        max_tokens: 250
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const reply = data.choices?.[0]?.message?.content || "Como posso ajudar com o seu projeto?";
                    return res.status(200).json({ reply, modelUsed: model });
                }

                lastStatus = response.status;
                const errText = await response.text();
                console.warn(`Groq retornou erro com modelo ${model} (status ${response.status}):`, errText);

                try {
                    lastError = JSON.parse(errText);
                } catch (_) {
                    lastError = errText;
                }

                // Se o modelo não foi encontrado ou foi descontinuado (404), tenta o próximo candidato
                if (response.status === 404) {
                    continue;
                }

                // Para outros erros (ex: 401 Chave inválida), não adianta tentar outro modelo
                break;
            } catch (err) {
                console.error(`Exceção ao chamar Groq com ${model}:`, err);
                lastError = err.message || "Falha de conexão";
                break;
            }
        }

        return res.status(lastStatus >= 400 && lastStatus < 600 ? lastStatus : 502).json({
            error: "Falha na comunicação com o provedor de IA",
            details: lastError
        });

    } catch (error) {
        console.error("Erro interno no /api/chat:", error);
        return res.status(500).json({ error: "Erro interno no servidor" });
    }
}

// Compatibilidade dupla (CommonJS e ES Modules) para qualquer versão de Node na Vercel
module.exports = handler;
module.exports.default = handler;
