# FATURISTA PARTE 1 - DOCUMENTACAO COMPLETA DO WORKFLOW

## Informacoes do Documento
- **Versao**: 1.0
- **Data**: 02/02/2026
- **Sistema**: n8n Workflow
- **Empresa**: Start Assessoria Previdenciaria

---

## VISAO GERAL DO SISTEMA

O workflow "Faturista Parte 1" e um sistema automatizado de faturamento para beneficios de Salario-Maternidade do INSS. Ele processa extratos de pagamento em PDF, calcula os valores devidos e cria faturas no Bitrix24.

### Objetivo Principal
Automatizar o processo de:
1. Extracao de dados de PDFs do INSS (Historico de Creditos)
2. Calculo de descontos INSS (progressivo)
3. Calculo de honorarios Start (30% do beneficio)
4. Criacao de faturas no sistema Bitrix24

---

## FLUXO PRINCIPAL DO WORKFLOW

```
WEBHOOK (1)
    |
    v
BUSCAR DEAL (Bitrix24)
    |
    v
1B. INICIALIZAR (normalizar dados)
    |
    v
2B. BUSCAR FATURAS CPF (verificar duplicidade)
    |
    v
2C. ANALISAR FATURAS (mapear existentes)
    |
    v
3. BUSCAR FILE ID (obter PDF)
    |
    v
[IF ERRO] --> 21. PREPARAR MSG ERRO --> 22. CHAT ERRO --> RESPONDER ERRO
    |
    v (OK)
3B. OBTER URL DISK
    |
    v
4. BAIXAR PDF
    |
    v
5. GEMINI EXTRAIR (IA - extracao OCR)
    |
    v
6A. CALCULO HISTORICO (organizar dados PDF)
    |
    v
6B. CALCULO INSS (descontos + calendario)
    |
    v
6C. CALCULO START (honorarios + faixas)
    |
    v
MERGE 1 (unir todos os dados)
    |
    v
6D. REVISOR DE CALCULOS (validacao final)
    |
    v
[7. IF ERRO] --> 21b MSG ERRO --> 22. CHAT ERRO
    |
    v (OK)
8B/8C. BUSCAR ULTIMA INVOICE + DEFINIR RESPONSAVEL
    |
    v
9. PREPARAR FATURA
    |
    v
12. GERAR RELATORIO HTML
    |
    v
10. CRIAR FATURA (Bitrix24 API)
    |
    v
[13A. IF PULAR] --> SKIP
    |
    v (OK)
14. PROCESSAR RESPOSTA FATURA
    |
    v
15. MONTAR ITENS CRIADOS
    |
    v
16. CHAT SUCESSO
    |
    v
[17. IF WARNING] --> 18. CHAT WARNING
    |
    v
MERGE --> MERGE1
    |
    v
18B. GRAVAR SUPABASE
    |
    v
18C/18D. SUPABASE LOGS
    |
    v
19. PREPARAR SHEETS
    |
    v
20. APPEND MASTER (Google Sheets)
    |
    v
21. RESPONDER OK
```

---

## LISTA COMPLETA DE NOS (41 nos)

| # | Nome do No | Tipo | Funcao |
|---|------------|------|--------|
| 1 | 1. Webhook | webhook | Recebe requisicao HTTP com deal_id |
| 2 | BUSCAR DEAL | httpRequest | Busca dados do negocio no Bitrix24 |
| 3 | 1B. Inicializar | code | Normaliza CPF, NB e prepara contexto |
| 4 | 2B. Buscar Faturas CPF | httpRequest | Verifica faturas existentes |
| 5 | 2C. Analisar Faturas | code | Analisa duplicidade e mapeia faturas |
| 6 | 3. Buscar File ID | code | Valida e obtem file_id do PDF |
| 7 | 3. IF Erro | if | Condicional de erro apos validacao |
| 8 | 3B. Obter URL Disk | httpRequest | Obtem URL de download do PDF |
| 9 | 4. Baixar PDF | httpRequest | Faz download do PDF |
| 10 | 5. Gemini Extrair2 | google-gemini | Extrai dados do PDF com IA |
| 11 | 6A. Calculo Historico | code | Organiza dados extraidos |
| 12 | 6B. Calculo INSS | code | Calcula descontos INSS |
| 13 | 6C. Calculo Start | code | Calcula honorarios Start |
| 14 | 6D. Revisor Calculos | code | Valida todos os calculos |
| 15 | 7. IF ERRO | if | Condicional pos-revisao |
| 16 | 8B. Buscar Ultima Invoice | httpRequest | Busca ultima fatura |
| 17 | 8C. Definir Responsavel | code | Define responsavel pela fatura |
| 18 | 9. Preparar Fatura | code | Monta payload da fatura |
| 19 | 10. Criar Fatura | httpRequest | Cria fatura no Bitrix24 |
| 20 | 12. Gerar Relatorio HTML | code | Gera relatorio visual |
| 21 | 13A. IF Pular | if | Condicional para pular |
| 22 | 14. Processar Resposta | code | Processa resposta da API |
| 23 | 15. Montar Itens | code | Monta lista de itens criados |
| 24 | 16. Chat Sucesso | httpRequest | Envia mensagem de sucesso |
| 25 | 17 IF Warning | if | Verifica warnings |
| 26 | 18. Chat Warning | httpRequest | Envia mensagem de warning |
| 27 | 18B. Gravar Supabase | supabase | Grava log no Supabase |
| 28 | 18C. Supabase execucoes | supabase | Log de execucoes |
| 29 | 18D. Supabase log | supabase | Log detalhado |
| 30 | 19. Preparar Sheets | code | Prepara dados para planilha |
| 31 | 20. Append MASTER | googleSheets | Grava no Google Sheets |
| 32 | 21. Responder OK | webhook | Responde sucesso |
| 33 | 21b preparar msg erro | code | Prepara mensagem de erro |
| 34 | 22. Chat Erro | httpRequest | Envia mensagem de erro |
| 35 | 23. Responder ERRO | webhook | Responde erro |
| 36 | 26. Responder SKIP | webhook | Responde skip |
| 37 | Merge 1 | merge | Une 6A, 6B, 6C, Gemini, Deal |
| 38 | Merge 2 | merge | Une dados para preparacao |
| 39 | Merge | merge | Une caminhos warning/ok |
| 40 | Merge1 | merge | Merge final para logs |
| 41 | 21 Preparar MSG Erro | code | Prepara erro alternativo |

---

## INTEGRACOES EXTERNAS

1. **Bitrix24** - CRM e gestao de negocios/faturas
2. **Google Gemini** - Extracao OCR de PDFs
3. **Supabase** - Banco de dados para logs
4. **Google Sheets** - Planilha MASTER de controle
5. **Chat (Bitrix)** - Notificacoes

---

## CAMPOS DO BITRIX24

### Campos do Deal (Negocio)
38 campos mapeados incluindo:
- CPF, RG, NIT, NB
- DIB, DIP, DCB (datas do beneficio)
- MR (Media de Remuneracao)
- Valores de parcelas, banco, etc.

### Campos da Invoice (Fatura)
57 campos mapeados incluindo:
- Todos os campos do Deal
- Competencia, periodo
- Honorarios Start, regra aplicada
- DARF, saldo restante

---

## PROXIMOS DOCUMENTOS

- `01_NO_6A_CALCULO_HISTORICO.md` - Detalhamento do no 6A
- `02_NO_6B_CALCULO_INSS.md` - Detalhamento do no 6B
- `03_NO_6C_CALCULO_START.md` - Detalhamento do no 6C
- `04_NO_6D_REVISOR_CALCULOS.md` - Detalhamento do no 6D
- `05_DEMAIS_NOS.md` - Documentacao dos demais nos
