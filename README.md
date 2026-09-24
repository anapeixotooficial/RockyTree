# 🌳 Rocky Tree Technologies - Site Institucional

<div align="center">
  <h3><strong>Soluções Sólidas em Tecnologia.</strong></h3>
  <p>Do hardware à nuvem. Infraestrutura, Desenvolvimento Web e Design inteligente para escalar seu negócio.</p>
</div>

<br>

## 🚀 Sobre o Projeto

Apresentação Digital oficial da **Rocky Tree Technologies**. Desenvolvido sob a arquitetura **One Page (Single Page)** de rolagem contínua com elementos de **Landing Page de Alta Conversão**, o site foi projetado sob os pilares do **Minimalismo Tecnológico (Tech Minimalist)**, **Dark UI** sofisticada e **High-Contrast Neon Accents** (Verde-Limão Neon `#ccff00`).

---

## 🎨 Identidade Visual e Estilo (UI/UX)

- **Dark UI:** Fundos em tons profundos de grafite e preto chumbo (`#06080c`, `#0b0f17`, `#111622`), transmitindo modernidade, elegância e robustez.
- **High-Contrast Neon Accents:** Cor de destaque única em verde-limão neon elétrico (`#ccff00`), direcionando a atenção do visitante para botões de ação (CTAs), divisores e destaques lógicos.
- **Tech Minimalist:** Tipografia geométrica sem serifa (`Space Grotesk` para títulos e `Inter` para leitura), ícones em formato de linha fina contornada (line-art SVGs) e blocos visuais bem definidos sem poluição visual.

---

## ✨ Estrutura One Page

1. **Apresentação & Hero:** Proposta de valor clara, efeito de digitação, métricas de confiabilidade e chamadas para "Ver Portfólio" e "Solicitar Orçamento".
2. **Sobre Nós:** Apresentação da marca fundada por **Ana Peixoto** e **Mikaell Rocha**, diferenciais de visão sistêmica do hardware ao software, atendimento local em Santo Antônio de Jesus (BA) e 100% remoto para todo o Brasil.
3. **Serviços Oferecidos:** 4 blocos técnicos modulares (Desenvolvimento Web, Infraestrutura & Redes, Hardware & Reparos, Design & Identidade) com modais interativos de valores detalhados.
4. **Portfólio Institucional:** Vitrine com cases práticos de projetos entregues e botão de solicitação com contexto direto no WhatsApp.
5. **Modelos de Atendimento:** Comparativo entre demandas pontuais (Projetos Avulsos) e parcerias com SLA (Assinaturas Mensais).
6. **Contato & Orçamento Express:** Formulário rápido que pré-formata o pedido do cliente e abre direto o WhatsApp oficial da equipe: **(75) 99872-9593**.

---

## 🤖 TreeBot IA 3.0 & Arquitetura Segura da API (Groq)

Para preservar o **sigilo absoluto** da chave de API `GROQ_API_KEY` (evitando exposição no navegador e vazamento em repositórios públicos):

1. **Sigilo de Credenciais (Vercel Serverless Function):**
   - O projeto utiliza a função backend [`api/chat.js`](api/chat.js) nativa da Vercel.
   - A `GROQ_API_KEY` é configurada nas **Environment Variables** da Vercel, mantendo a chave 100% no servidor sem qualquer exposição no navegador.
2. **Motor Resiliente Local (Fail-Safe Instantâneo):**
   - Caso o backend esteja offline ou em configuração, o `treebot.js` possui um motor de resolução de intenções local integrado. Ele responde instantaneamente a dúvidas sobre preços, serviços, prazos e direciona o usuário para o WhatsApp oficial com 100% de disponibilidade.

---

## 👥 Liderança Técnica

- **Ana Peixoto** - Especialista em Tecnologia, Redes de Computadores e Gestão de Sistemas.
- **Mikaell Rocha** - Especialista em Infraestrutura, Redes, Hardware e Desenvolvimento Full-Stack.

---

<div align="center">
  <p>Construído por <a href="https://github.com/anapeixotooficial">Rocky Tree Technologies</a> &copy; 2026.</p>
</div>
