# 🚀 OneStart

**Sistema Web Fullstack - Start Assessoria Previdenciária**

## 📋 Sobre

Sistema de gestão do módulo de Recebimento da Start Assessoria, construído com Next.js 14 e Tailwind CSS.

## 🛠️ Tecnologias

- **Next.js 14** - Framework React
- **Tailwind CSS** - Estilização
- **React 18** - Interface

## 📂 Estrutura

```
onestart-app/
├── app/
│   ├── layout.js                      # Layout principal
│   ├── page.js                        # Dashboard (home)
│   ├── globals.css                    # Estilos globais
│   ├── recebimento/
│   │   ├── relatorios/
│   │   │   ├── gerador/page.js        # ✅ Gerador de Relatórios
│   │   │   └── historico/page.js      # 🚧 Histórico
│   │   ├── faturas/page.js            # 🚧 Faturas
│   │   ├── clientes/page.js           # 🚧 Clientes
│   │   └── inadimplentes/page.js      # 🚧 Inadimplentes
│   └── config/page.js                 # 🚧 Configurações
├── components/
│   └── Sidebar.js                     # Menu lateral
├── public/                            # Arquivos estáticos
├── package.json
├── tailwind.config.js
└── next.config.js
```

## 🎨 Design

| Elemento | Cor |
|----------|-----|
| Sidebar | Azul escuro (#151b27) |
| Destaque | Amarelo (#f59e0b) |
| Background | Cinza (#f3f4f6) |
| Cards | Branco |

## 🚀 Deploy

### Opção 1: Vercel (Recomendado)

1. Faça push para o GitHub
2. Conecte o repositório na Vercel
3. Deploy automático!

### Opção 2: Local

```bash
npm install
npm run dev
```

Acesse: http://localhost:3000

## 📱 Responsivo

- Desktop: Menu lateral fixo (260px)
- Mobile: Menu hamburguer

---

© 2026 Start Assessoria Previdenciária
