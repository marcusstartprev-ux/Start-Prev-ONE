# Como adicionar um setor (resumo)

1. Adicione a entrada no arquivo src/data/seed/menus.json ou use o endpoint de administração que você criar.
2. Crie as rotas de frontend em src/pages/<setor>/ e subpáginas em subpastas.
3. Crie services em src/features/<setor>/services/ para comunicação com Supabase/Bitrix.
4. Atualize scripts/seed-menu.ts ou rode via painel/endpoint para persistir no Supabase.
