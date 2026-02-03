# DEMAIS NOS DO WORKFLOW

## Documentacao dos Nos Auxiliares

---

## 1. WEBHOOK (No 1)

### Informacoes
- **Tipo**: n8n-nodes-base.webhook
- **Webhook ID**: faturista-v15

### Objetivo
Recebe requisicao HTTP POST com o deal_id para iniciar o processamento.

### Payload Esperado
```json
{
  "deal_id": 12345
}
```

### Saida
Envia para: BUSCAR DEAL

---

## 1B. INICIALIZAR

### Objetivo
Normaliza e prepara os dados iniciais recebidos do Deal.

### Funcoes
1. Normalizar CPF (remover pontuacao, validar 11 digitos)
2. Normalizar NB (remover pontuacao)
3. Formatar CPF e NB para exibicao
4. Extrair nome do cliente
5. Preparar file_id do PDF

### Saida
```javascript
{
  deal_id: 12345,
  cpf: "12345678900",
  cpf_formatado: "123.456.789-00",
  nb: "1234567890",
  nb_formatado: "123.456.789-0",
  nome: "Maria Silva",
  file_id: 67890,
  // ...
}
```

### Dependencias
- Anterior: BUSCAR DEAL
- Posterior: 2B. Buscar Faturas CPF

---

## 2B. BUSCAR FATURAS CPF

### Objetivo
Busca faturas existentes no Bitrix24 para o CPF do cliente.

### API Utilizada
```
POST https://startprev.bitrix24.com.br/rest/.../crm.item.list
entityTypeId: 31 (Smart Invoice)
filter: { "=parentId2": deal_id }
```

### Campos Retornados
- id, title, stageId
- CPF, NB
- Valores (start, inss, cliente)
- Datas (inss, pagamento)
- Competencia, parcela

### Dependencias
- Anterior: 1B. Inicializar
- Posterior: 2C. Analisar Faturas

---

## 2C. ANALISAR FATURAS

### Objetivo
Analisa as faturas existentes para detectar duplicidade.

### Funcoes
1. Mapear faturas por competencia
2. Mapear faturas por data INSS
3. Separar faturas (pagas, pendentes, canceladas)
4. Calcular saldo ja cobrado
5. Definir flags (tem_faturas, tem_faturas_ativas)

### Regra de Bloqueio
Se ja existem faturas para o Deal, bloqueia criacao de novas.

### Dependencias
- Anterior: 2B. Buscar Faturas CPF
- Posterior: 3. Buscar File ID

---

## 3. BUSCAR FILE ID

### Objetivo
Valida e obtem o file_id do PDF anexado ao Deal.

### Regras
1. Se ja tem faturas -> BLOQUEAR (evita duplicidade)
2. Se nao tem file_id -> BLOQUEAR (nao tem PDF)

### Dependencias
- Anterior: 2C. Analisar Faturas
- Posterior: 3. IF Erro

---

## 3. IF ERRO (Condicional)

### Condicao
```javascript
$json.erro === true || $json.tem_faturas === true
```

### Caminhos
- **TRUE**: 21 Preparar MSG Erro -> Chat Erro
- **FALSE**: 3B. Obter URL Disk (continua processamento)

---

## 3B. OBTER URL DISK

### Objetivo
Obtem a URL de download do PDF no Bitrix Disk.

### API Utilizada
```
GET https://startprev.bitrix24.com.br/rest/.../disk.file.get?id={file_id}
```

### Retorno
```javascript
{
  result: {
    DOWNLOAD_URL: "https://..."
  }
}
```

---

## 4. BAIXAR PDF

### Objetivo
Faz download do arquivo PDF.

### Configuracao
- Timeout: 60 segundos
- Response format: file (binario)

---

## 5. GEMINI EXTRAIR2

### Objetivo
Usa Google Gemini (IA) para extrair dados do PDF.

### Modelo
`models/gemini-2.5-flash`

### Prompt
Instrucoes detalhadas para:
- Extrair identificacao (nome, cpf, nit)
- Extrair beneficio (nb, mr, dib, dip, dcb)
- Extrair todos os creditos
- Extrair rubricas (101, 104, 110, 137, 206, 215)
- Retornar JSON valido

---

## 7. IF ERRO (Pos-6D)

### Condicao
```javascript
$json.ok === false
```

### Caminhos
- **TRUE (erro)**: 21b preparar msg erro
- **FALSE (ok)**: 8B. Buscar Ultima Invoice

---

## 8B. BUSCAR ULTIMA INVOICE

### Objetivo
Busca a ultima fatura criada para determinar o proximo numero de parcela.

---

## 8C. DEFINIR RESPONSAVEL

### Objetivo
Define o responsavel (assignedById) para a nova fatura.

### Logica
- Usa assessor do Deal
- Fallback para usuario padrao

---

## 9. PREPARAR FATURA

### Objetivo
Monta o payload completo para criar a fatura no Bitrix24.

### Estrutura do Payload
```javascript
{
  entityTypeId: 31,
  fields: {
    title: "Fatura #1 - Maria Silva",
    stageId: "DT31_2:NEW",
    assignedById: 123,
    parentId2: deal_id,
    // Campos customizados (CI)
    [CI.cpf]: "12345678900",
    [CI.nb]: "1234567890",
    [CI.valor_previsto]: "560|BRL",
    [CI.valor_cliente]: "840|BRL",
    [CI.competencia]: "01/2026",
    [CI.data_inss]: "2026-01-27T03:00:00+00:00",
    // ... etc
  }
}
```

---

## 10. CRIAR FATURA

### Objetivo
Cria a fatura no Bitrix24 via API.

### API Utilizada
```
POST https://startprev.bitrix24.com.br/rest/.../crm.item.add
```

---

## 12. GERAR RELATORIO HTML

### Objetivo
Gera um relatorio visual em HTML com os dados da fatura.

### Conteudo
- Resumo do cliente
- Detalhes do beneficio
- Valores calculados
- Parcelas criadas

---

## 13A. IF PULAR

### Condicao
Verifica se deve pular a criacao de fatura.

---

## 14. PROCESSAR RESPOSTA FATURA

### Objetivo
Processa a resposta da API de criacao de fatura.

### Validacoes
- Verifica se criou com sucesso
- Extrai ID da fatura criada
- Trata erros

---

## 15. MONTAR ITENS CRIADOS

### Objetivo
Monta lista de faturas criadas para log e notificacao.

---

## 16. CHAT SUCESSO

### Objetivo
Envia mensagem de sucesso no chat do Bitrix24.

### Conteudo
- Nome do cliente
- Quantidade de faturas criadas
- Link para as faturas

---

## 17 IF WARNING

### Condicao
Verifica se tem warnings para reportar.

---

## 18. CHAT WARNING

### Objetivo
Envia mensagem de warning no chat.

---

## 18B/18C/18D. SUPABASE

### Objetivo
Grava logs de execucao no Supabase.

### Tabelas
- faturista_execucoes
- execucoes_log

---

## 19. PREPARAR SHEETS

### Objetivo
Prepara dados para gravar no Google Sheets.

---

## 20. APPEND MASTER

### Objetivo
Grava linha na planilha MASTER de controle.

---

## 21. RESPONDER OK

### Objetivo
Responde ao webhook com sucesso.

---

## 22. CHAT ERRO

### Objetivo
Envia mensagem de erro no chat.

---

## 23. RESPONDER ERRO

### Objetivo
Responde ao webhook com erro.

---

## 26. RESPONDER SKIP

### Objetivo
Responde ao webhook indicando que pulou.

---

## MERGE 1

### Objetivo
Une os outputs de:
- 5. Gemini Extrair2 (index 0)
- 6A. Calculo Historico (index 1)
- 6B. Calculo INSS (index 2)
- 6C. Calculo Start (index 3)
- BUSCAR DEAL (index 4)

### Saida
Envia para: 6D. Revisor de Calculos

---

## MERGE 2

### Objetivo
Une dados apos definicao de responsavel.

### Saida
Envia para: 9. Preparar Fatura

---

## MERGE e MERGE1

### Objetivo
Consolidam diferentes caminhos do fluxo para finalizacao.
