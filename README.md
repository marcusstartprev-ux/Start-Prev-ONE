# Start-Prev-ONE (scaffold)

Estrutura inicial do projeto voltada para Next.js + Supabase. Objetivo: app web modular com menu/setores e integração com Bitrix e n8n.

Como rodar localmente (dev):
1. Copie .env.example para .env.local e preencha as variáveis.
2. npm install
3. npm run dev

Arquitetura (resumo):
- next.js app (src/pages)
- integrações via API routes (src/pages/api)
- seed do menu em src/data/seed/menus.json
- script de seed em scripts/seed-menu.ts

Branch scaffold-fullstack contém este scaffold.
