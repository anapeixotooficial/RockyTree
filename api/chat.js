/**
 * ============================================================================
 * VERCEL SERVERLESS FUNCTION - /api/chat
 * ============================================================================
 * A Vercel executa este arquivo no BACKEND (Node.js).
 * A chave process.env.GROQ_API_KEY fica 100% segura no servidor e NUNCA
 * é exposta para o navegador do visitante.
 * ============================================================================
 */

export default async function handler(req, res) {
    // Permitir apenas requisições POST
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido" });
    }

    // Leitura da chave secreta configurada no painel da Vercel
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            error: "GROQ_API_KEY não foi configurada nas Environment Variables da Vercel."
        });
    }

    try {
        const { messages = [] } = req.body || {};

        // Prompt de sistema que roda exclusivamente no servidor
        const systemPrompt = {
            role: "system",
            content: `Você é o TreeBot 🌲, assistente virtual da Rocky Tree Technologies (fundada por Ana Peixoto e Mikaell Rocha em Santo Antônio de Jesus - BA).
Responda de forma direta, técnica, simpática e objetiva (máximo 2 a 3 frases).
Esclareça as dúvidas sobre Desenvolvimento Web/Landing Pages, Infraestrutura de Redes, Hardware/PC Gamer e Design de Marcas com naturalidade.
Converse normalmente com o usuário. Só sugira ou direcione para o WhatsApp quando for realmente necessário (por exemplo, quando o cliente pedir orçamento formal, demonstrar intenção de fechar negócio ou solicitar contato humano direto).`
        };

        // Requisição sigilosa para a Groq (oculta no backend)
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
            console.error("Erro Groq API:", errData);
            return res.status(response.status).json({
                error: "Falha na comunicação com o provedor de IA"
            });
        }

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || "Como posso ajudar com o seu projeto?";

        // Devolve apenas a resposta textual para o TreeBot
        return res.status(200).json({ reply });

    } catch (error) {
        console.error("Erro interno no /api/chat:", error);
        return res.status(500).json({ error: "Erro interno no servidor" });
    }
}
