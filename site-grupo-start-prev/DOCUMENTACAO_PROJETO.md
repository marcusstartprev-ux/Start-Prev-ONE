# 📋 Documentação do Projeto - Site Grupo Start Prev

**Data de criação:** 06/02/2026
**Última atualização:** 06/02/2026
**Repositório:** Site Grupo Start Prev
**URL de Produção:** https://www.grupostartprev.com.br

---

## 📌 Visão Geral do Projeto

Este projeto é um **sistema de chat para atendimento de clientes** da Start Prev Assessoria, especializada em Salário Maternidade. O sistema permite que clientes que preenchem um formulário no site do fornecedor sejam redirecionadas para uma página de chat personalizada.

### Objetivos Principais:
1. Criar uma página de chat profissional e moderna
2. Personalizar a experiência baseada nos dados do formulário
3. Integrar com Supabase para persistência de mensagens
4. Integrar com N8N para automação e Bitrix24
5. Implementar Push Notifications para alertar clientes

---

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO DO SISTEMA                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Cliente preenche formulário no site do fornecedor           │
│              │                                                  │
│              ▼                                                  │
│  2. Formulário envia dados para N8N (webhook)                   │
│              │                                                  │
│              ▼                                                  │
│  3. N8N processa e redireciona cliente para:                    │
│     https://www.grupostartprev.com.br/chat.html?nome=X&...      │
│              │                                                  │
│              ▼                                                  │
│  4. Chat abre com mensagem personalizada                        │
│     - Analisa dados da URL (classificação, perfil, etc)         │
│     - Mostra card de análise do caso                            │
│              │                                                  │
│              ▼                                                  │
│  5. Cliente envia mensagens                                     │
│     - Salva no Supabase (tabela messages)                       │
│     - Envia para /api/webhook → N8N                             │
│              │                                                  │
│              ▼                                                  │
│  6. Assessor responde (via Bitrix ou painel)                    │
│     - Mensagem salva no Supabase                                │
│     - Supabase Realtime notifica o chat                         │
│     - Push Notification enviada para cliente                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Arquivos

```
C:\START PREVE ONE\Site Grupo Start Prev\
├── public/
│   ├── chat.html              # Página principal do chat
│   ├── service-worker.js      # Service Worker para Push Notifications
│   ├── logo-start.png         # Logo do Grupo Start Prev (watermark)
│   ├── logo-startprev.jpg     # Logo Start Prev (avatar padrão)
│   ├── logo-maesocial.jpg     # Logo Mãe Social (avatar alternativo)
│   ├── logo-start-prev.png    # Logo alternativo
│   └── icons/
│       ├── icon-192.png       # Ícone para notificações (192x192)
│       └── badge-72.png       # Badge para notificações (72x72)
├── src/
│   └── pages/
│       ├── index.js           # Página inicial (redirect)
│       ├── _app.js            # App wrapper Next.js
│       └── api/
│           └── webhook.js     # API endpoint que repassa para N8N
├── package.json
├── .gitignore
└── DOCUMENTACAO_PROJETO.md    # Este documento
```

---

## 🎨 Página de Chat (chat.html)

### Funcionalidades Implementadas:

#### 1. **Tela de Boas-Vindas**
- Logo animado com anel giratório
- Texto "StartPrev" com destaque amarelo
- Loader com pontos animados
- Desaparece após 2.2 segundos

#### 2. **Header**
- Avatar com logo dinâmico (Start Prev ou Mãe Social)
- Nome do atendente "Marcus — Start Prev"
- Indicador "Online agora" com ponto verde pulsante
- Botão de notificações (sino)

#### 3. **Mensagem Inicial Inteligente**
```javascript
// Gera saudação personalizada baseada no perfil
function mkGreeting() {
  // Se gestante do 1º filho: "Parabéns pela gestação do seu primeiro filho! 🎉"
  // Se gestante: "Parabéns pela gestação! 🎉 Que momento lindo!"
  // Se mãe: "Que bom que está buscando seus direitos como mãe! 💪"
}
```

#### 4. **Card de Análise do Caso**
Exibe informações baseadas nos parâmetros da URL:
- Tipo de benefício (Rural, DPP, 135, MEI, etc.)
- Perfil (Gestante/Mãe)
- Situação profissional
- Filhos menores de 5 anos
- Diagnóstico especial
- Seguro desemprego
- Tempo após demissão

**Botão CTA:** "💰 Vamos ver se posso receber mais de R$ 5 mil?"

#### 5. **Sistema de Mensagens**
- Texto com formatação (*negrito*)
- Áudio com player customizado (waveform animado)
- Imagens com visualização fullscreen
- Arquivos com ícone e tamanho
- Indicador de "digitando..."
- Horário e check de leitura

#### 6. **Gravação de Áudio**
- Pressionar e segurar para gravar
- Timer de duração
- Barras de onda animadas
- Botão cancelar
- Limite de 2 minutos

#### 7. **Envio de Arquivos**
- Suporta imagens e documentos
- Preview antes de enviar
- Upload para Supabase Storage

---

## 🔧 Integrações

### 1. **Supabase**

**Configuração:**
```javascript
const SUPABASE_URL = 'https://tvlinuakttpvbwoirdkk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGci...';
const sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

**Tabelas utilizadas:**
- `messages` - Armazena todas as mensagens do chat
- `push_tokens` - Armazena tokens de Push Notification
- `chat_sessions` - Sessões de chat (opcional)
- `chat_clientes` - Dados dos clientes (opcional)

**Campos da tabela `messages`:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | ID único |
| session_id | text | ID da sessão do chat |
| remetente | text | 'cliente' ou 'assessor' |
| tipo | text | 'texto', 'audio', 'imagem', 'arquivo' |
| conteudo | text | Conteúdo da mensagem |
| arquivo_url | text | URL do arquivo (se houver) |
| arquivo_nome | text | Nome do arquivo |
| arquivo_tamanho | int | Tamanho em bytes |
| cliente_nome | text | Nome do cliente |
| cliente_celular | text | Celular do cliente |
| metadata | jsonb | Dados extras (classificacao, origem, etc) |
| entregue | bool | Se foi entregue |
| created_at | timestamp | Data de criação |

**Supabase Realtime:**
```javascript
function iniciarRealtime() {
  sbClient
    .channel('mensagens-' + SID)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: 'session_id=eq.' + SID
    }, (payload) => {
      // Exibe mensagem recebida do assessor
    })
    .subscribe();
}
```

**Supabase Storage:**
- Bucket: `chat-files`
- Path: `chat/{session_id}/{timestamp}_{filename}`

---

### 2. **N8N (Webhook)**

**Endpoint interno (Vercel):**
```
POST /api/webhook
```

**Repassa para N8N:**
```javascript
const N8N_WEBHOOK_URL = 'https://startprev.app.n8n.cloud/webhook-test/form-startprev';
// Para produção: 'https://startprev.app.n8n.cloud/webhook/form-startprev'
```

**Dados enviados:**
```json
{
  "tipo": "mensagem_chat",
  "session_id": "1738851234567-abc123",
  "nome": "Sandrieli Kotkoski",
  "celular": "(47)99699-9018",
  "classificacao": "RURALQ",
  "mensagem": "Texto da mensagem",
  "timestamp": "2026-02-06T15:30:00.000Z"
}
```

---

### 3. **Push Notifications**

**VAPID Key:**
```javascript
const VAPID_PUBLIC_KEY = 'BLBz5hj99KaCmJcOj0FAQA_gbtlsCZ_xyEOGPL4ElxOrbSq6cLeNJi7dIj7xyYox7RsGRKp4T9XEXj9kDqX_Pws';
```

**Service Worker (`service-worker.js`):**
- Recebe eventos `push`
- Exibe notificação com título, corpo, ícone
- Ao clicar, abre ou foca a aba do chat
- Envia mensagem para navegar à sessão correta

**Fluxo de ativação:**
1. Usuário clica no botão de sino (ou após 10s automaticamente)
2. Solicita permissão do navegador
3. Registra Service Worker
4. Cria subscription com VAPID key
5. Salva token no Supabase (`push_tokens`)
6. Atualiza UI (ícone verde)

---

## 🎨 Design System

### Cores (CSS Variables):
```css
:root {
  /* Cinzas (tema escuro) */
  --gray-900: #18181f;  /* Fundo principal */
  --gray-800: #1c1c24;  /* Header/Footer */
  --gray-700: #25252f;  /* Cards/Bubbles equipe */
  --gray-600: #32323e;
  --gray-500: #4a4a58;
  --gray-400: #6b6b7a;  /* Texto secundário */
  --gray-300: #9090a0;
  --gray-200: #b8b8c8;
  --gray-100: #e0e0ea;
  --snow: #f4f4f8;      /* Texto principal */
  --white: #ffffff;

  /* Azul Royal */
  --royal: #2563eb;
  --royal-dark: #1d4ed8;
  --royal-light: #3b82f6;
  --royal-glow: rgba(37,99,235,0.25);

  /* Amarelo Frevo */
  --yellow: #f5c518;
  --yellow-dark: #e6b800;
  --yellow-glow: rgba(245,197,24,0.25);
}
```

### Animações:
- `spinRing` - Anel giratório do logo
- `wFade` - Fade in com movimento
- `wBounce` - Bounce dos dots
- `msgIn` - Entrada das mensagens
- `bounceDot` - Dots do "digitando"
- `pulseDot` - Ponto verde pulsante
- `recWave` - Ondas da gravação
- `ctaShine` - Brilho passando no botão CTA

---

## 🔀 Logo Dinâmico

O sistema alterna entre logos baseado no parâmetro `origem`:

```javascript
const origemLower = (P.origem || '').toLowerCase().replace(/\s+/g, '');
const isMaeSocial = origemLower.includes('maesocial') ||
                    origemLower.includes('mãesocial') ||
                    origemLower.includes('mae social');

const LOGO_PARCEIRO = isMaeSocial ? '/logo-maesocial.jpg' : '/logo-startprev.jpg';
const LOGO_GRUPO = '/logo-start.png'; // Watermark de fundo
```

**Onde aparece:**
- Avatar no header
- Avatar nas mensagens da equipe
- Tela de boas-vindas
- Watermark centralizado (logo do grupo, opacity 4%)

---

## 📊 Parâmetros da URL

O chat lê os seguintes parâmetros da URL:

| Parâmetro | Exemplo | Uso |
|-----------|---------|-----|
| nome | Sandrieli Kotkoski | Nome da cliente |
| celular | (47)99699-9018 | Telefone |
| perfil | Sou Mãe. Mas não estou Gestante. | Tipo de perfil |
| situacao | Sou Trabalhadora RURAL | Situação profissional |
| filhos | Sim | Tem filhos < 5 anos |
| diagnostico | TEA | Diagnóstico especial |
| nascimento | Eu estava Empregada... | Situação no nascimento |
| seguro_desemprego | Não | Recebeu seguro |
| apos_demissao | Em menos de 1 ano | Tempo após demissão |
| canal | Whatsapp | Canal preferido |
| classificacao | RURALQ | Classificação do lead |
| origem | googleads3 | Origem do tráfego |

**Exemplo de URL completa:**
```
https://www.grupostartprev.com.br/chat.html?nome=Sandrieli%20Kotkoski&celular=(47)99699-9018&perfil=Sou%20M%C3%A3e&situacao=Sou%20Trabalhadora%20RURAL&filhos=Sim&classificacao=RURALQ&origem=googleads3
```

---

## 🔄 Fluxo de Mensagens

### Cliente envia mensagem:

```javascript
async function enviarTexto() {
  // 1. Mostra na tela imediatamente
  addMsg('texto', 'cliente', { texto: txt });

  // 2. Salva no Supabase
  await sbClient.from('messages').insert({
    session_id: SID,
    remetente: 'cliente',
    tipo: 'texto',
    conteudo: txt,
    cliente_nome: P.nome,
    cliente_celular: P.celular,
    metadata: { classificacao: P.classificacao, origem: P.origem }
  });

  // 3. Envia para N8N via webhook
  fetch('/api/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tipo: 'mensagem_chat',
      session_id: SID,
      nome: P.nome,
      celular: P.celular,
      mensagem: txt,
      ...
    })
  });

  // 4. Mostra indicador de "digitando"
  showTyp();
}
```

### Assessor responde:

```javascript
// Supabase Realtime detecta INSERT na tabela messages
sbClient.channel('mensagens-' + SID)
  .on('postgres_changes', { event: 'INSERT', ... }, (payload) => {
    const msg = payload.new;

    // Ignora mensagens do próprio cliente
    if (msg.remetente === 'cliente') return;

    // Remove "digitando" e mostra mensagem
    hideTyp();
    addMsg('texto', 'equipe', { texto: msg.conteudo });

    // Marca como entregue
    sbClient.from('messages').update({ entregue: true }).eq('id', msg.id);
  });
```

---

## 🚀 Deploy

**Plataforma:** Vercel
**Domínio:** www.grupostartprev.com.br

**Comando de deploy:**
```bash
cd "C:\START PREVE ONE\Site Grupo Start Prev"
npx vercel --prod --yes
```

**URLs geradas:**
- Produção: https://www.grupostartprev.com.br
- Preview: https://site-grupo-startprev-xxx.vercel.app

---

## ⚠️ Pendências e TODOs

### Crítico:
- [ ] **Ativar workflow no N8N** - O workflow está inativo, retorna 404
- [ ] **Criar bucket `chat-files` no Supabase** - Para upload de arquivos
- [ ] **Testar Push Notifications end-to-end**

### Melhorias futuras:
- [ ] Integração completa Chat → Bitrix Timeline
- [ ] Painel administrativo para assessores
- [ ] Histórico de conversas por cliente
- [ ] Métricas e analytics

---

## 📝 Histórico de Alterações

| Data | Alteração |
|------|-----------|
| 06/02/2026 | Criação inicial do chat.html com design completo |
| 06/02/2026 | Implementação de logo dinâmico (Mãe Social vs Start Prev) |
| 06/02/2026 | Implementação do watermark do Grupo Start Prev |
| 06/02/2026 | Integração com Supabase Realtime |
| 06/02/2026 | Criação do Service Worker para Push Notifications |
| 06/02/2026 | Integração de Push Notifications no frontend |
| 06/02/2026 | Modificação de enviarTexto() para salvar no Supabase |
| 06/02/2026 | Modificação de enviarArquivo() para upload no Supabase |
| 06/02/2026 | Modificação de stopRec() (áudio) para salvar no Supabase |
| 06/02/2026 | Modificação de ctaClick() para salvar no Supabase |
| 06/02/2026 | Atualização do webhook.js para repassar ao N8N |

---

## 🔐 Credenciais e Configurações

### Supabase:
- **URL:** https://tvlinuakttpvbwoirdkk.supabase.co
- **Anon Key:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### N8N:
- **URL Teste:** https://startprev.app.n8n.cloud/webhook-test/form-startprev
- **URL Produção:** https://startprev.app.n8n.cloud/webhook/form-startprev

### VAPID (Push):
- **Public Key:** BLBz5hj99KaCmJcOj0FAQA_gbtlsCZ_xyEOGPL4ElxOrbSq6cLeNJi7dIj7xyYox7RsGRKp4T9XEXj9kDqX_Pws

### Vercel:
- **Projeto:** site-grupo-startprev
- **Time:** startprev
- **Domínio:** www.grupostartprev.com.br

---

## 📞 Suporte

Para dúvidas ou problemas, verificar:
1. Console do navegador (F12) para erros JavaScript
2. Logs da Vercel para erros do webhook
3. Supabase Dashboard para dados das tabelas
4. N8N Executions para verificar se dados chegaram

---

*Documento gerado automaticamente pelo Claude Code*
