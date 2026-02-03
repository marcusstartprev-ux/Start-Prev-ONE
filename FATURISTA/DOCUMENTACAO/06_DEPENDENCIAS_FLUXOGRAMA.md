# DEPENDENCIAS ENTRE NOS - FLUXOGRAMA

## Mapa Visual de Dependencias

---

## FLUXO PRINCIPAL

```
[1. Webhook]
     |
     v
[BUSCAR DEAL] -----> [Merge1] (index 5)
     |
     v
[1B. Inicializar]
     |
     v
[2B. Buscar Faturas CPF]
     |
     v
[2C. Analisar Faturas]
     |
     v
[3. Buscar File ID]
     |
     v
[3. IF Erro] -----(erro)----> [21 Preparar MSG Erro] -> [22. Chat Erro] -> [23. Responder ERRO]
     |
     |(ok)
     v
[3B. Obter URL Disk]
     |
     v
[4. Baixar PDF]
     |
     v
[5. Gemini Extrair2] -----> [Merge 1] (index 0)
     |                  |
     |                  +---> [Merge1] (index 6)
     v
[6A. Calculo Historico] -----> [Merge 1] (index 1)
     |
     v
[6B. Calculo INSS] -----> [Merge 1] (index 2)
     |                |
     |                +---> [6C. Calculo Start]
     v
[6C. Calculo Start] -----> [Merge 1] (index 3)
```

---

## MERGE 1 E REVISAO

```
[Merge 1] <----- (5 inputs)
     |           |-- [5. Gemini] (index 0)
     |           |-- [6A] (index 1)
     |           |-- [6B] (index 2)
     |           |-- [6C] (index 3)
     |           +-- [BUSCAR DEAL] (index 4)
     v
[6D. Revisor de Calculos]
     |
     v
[7. IF ERRO] -----(erro)----> [21b preparar msg erro] -> [22. Chat Erro]
     |
     |(ok)
     v
[8B. Buscar Ultima Invoice]
     |
     v
[8C. Definir Responsavel]
     |
     v
[Merge 2]
```

---

## CRIACAO DE FATURA

```
[Merge 2]
     |
     v
[9. Preparar Fatura]
     |
     v
[12. Gerar Relatorio HTML]
     |
     v
[10. Criar Fatura]
     |
     v
[13A. IF Pular] -----(pular)----> [26. Responder SKIP]
     |
     |(ok)
     v
[14. Processar Resposta Fatura]
     |
     v
[15. Montar itens_criados]
     |
     v
[16. Chat Sucesso]
     |
     v
[17 IF Warning] -----(warning)----> [18. Chat Warning]
     |                                    |
     |(sem warning)                       |
     v                                    v
[Merge] <---------------------------------+
```

---

## FINALIZACAO E LOGS

```
[Merge]
     |
     v
[Merge1] <----- (7 inputs)
     |           |-- [Merge] (index 0)
     |           |-- [13A. IF Pular - skip] (index 1)
     |           |-- (vazio) (index 2)
     |           |-- [22. Chat Erro] (index 3)
     |           |-- [21b preparar msg erro] (index 4)
     |           |-- [BUSCAR DEAL] (index 5)
     |           +-- [5. Gemini Extrair2] (index 6)
     v
[18B. Gravar Supabase]
     |
     v
[18C. Supabase faturista_execucoes]
     |
     v
[18D. Supabase execucoes_log]
     |
     v
[19. Preparar Sheets]
     |
     v
[20. Append MASTER]
     |
     v
[21. Responder OK]
```

---

## TABELA DE DEPENDENCIAS DOS NOS 6

### 6A. Calculo do Historico de credito (PDF)

| Depende de | Fornece para |
|------------|--------------|
| 5. Gemini Extrair2 | 6B. Calculo do INSS |
| 2C. Analisar Faturas | Merge 1 |
| BUSCAR DEAL | 6D. Revisor de Calculos (via Merge) |

### 6B. Calculo do INSS

| Depende de | Fornece para |
|------------|--------------|
| 6A. Calculo do Historico | 6C. Calculo Start |
| - | Merge 1 |
| - | 6D. Revisor de Calculos (via Merge) |

### 6C. Calculo Start

| Depende de | Fornece para |
|------------|--------------|
| 6B. Calculo do INSS | Merge 1 |
| - | 6D. Revisor de Calculos (via Merge) |

### 6D. Revisor de Calculos

| Depende de | Fornece para |
|------------|--------------|
| 5. Gemini Extrair2 (via Merge 1) | 7. IF ERRO |
| 6A. Calculo do Historico (via Merge 1) | 8B. Buscar Ultima Invoice (se ok) |
| 6B. Calculo do INSS (via Merge 1) | 21b preparar msg erro (se erro) |
| 6C. Calculo Start (via Merge 1) | - |
| BUSCAR DEAL (via Merge 1) | - |
| 1B. Inicializar | - |

---

## DADOS PASSADOS ENTRE NOS 6

### 6A -> 6B

```javascript
{
  cliente: { nome, cpf, nit },
  beneficio: { nb, especie, mr, dib, dip, dcb, dias_beneficio, valor_diario, banco },
  creditos: [...],
  cobertura: { dias_cobertos, dias_restantes, percentual },
  campos_deal: {...},
  campos_invoice_base: {...},
  tags: [...],
  alertas: [...]
}
```

### 6B -> 6C

```javascript
{
  resumo: { nome, cpf, nb, mr, desconto_inss, aliquota_efetiva, total_120_dias },
  dados: {
    deal: {...},
    cliente: {...},
    beneficio: {...},
    creditos: [...],
    parcelas_projetadas: [...]
  },
  tags: [...],
  campos_deal: {...},
  campos_invoice_base: {...}
}
```

### 6C -> 6D (via Merge)

```javascript
{
  resumo: { nome, cpf, nb, honorarios_start, parcelas_total, parcela_quitacao },
  dados: {
    deal: {...},
    parcelas: [...],
    config: {...}
  },
  tags_sucesso: [...],
  alertas: [...],
  campos_deal: {...},
  campos_invoice_base: {...}
}
```

### 6D -> 7. IF ERRO

```javascript
{
  ok: true/false,
  erro: null ou { tag, codigo, mensagem },
  resumo: {...},
  dados: {...},
  auditoria: {...},
  campos_deal: {...},
  campos_invoice_base: {...}
}
```

---

## FLUXO DE ERROS

```
Qualquer ponto pode gerar erro:

1B (CPF invalido) ----+
                      |
2C (Faturas existem) -+
                      |
3 (PDF nao existe) ---+
                      |
6A (Parse Gemini) ----+----> 21/21b Preparar MSG Erro -> 22. Chat Erro -> 23. Responder ERRO
                      |
6B (Calendario) ------+
                      |
6C (Honorarios) ------+
                      |
6D (Validacao) -------+
                      |
10 (API Bitrix) ------+
```

---

## RESUMO DE CONEXOES

| No Origem | No Destino | Tipo |
|-----------|------------|------|
| 1. Webhook | BUSCAR DEAL | main |
| BUSCAR DEAL | 1B. Inicializar | main |
| BUSCAR DEAL | Merge1 | main (index 5) |
| 1B. Inicializar | 2B. Buscar Faturas CPF | main |
| 2B | 2C | main |
| 2C | 3. Buscar File ID | main |
| 3 | 3. IF Erro | main |
| 3. IF Erro (true) | 21 Preparar MSG | main |
| 3. IF Erro (false) | 3B. Obter URL Disk | main |
| 3B | 4. Baixar PDF | main |
| 4 | 5. Gemini Extrair2 | main |
| 5 | 6A | main |
| 5 | Merge 1 (index 0) | main |
| 5 | Merge1 (index 6) | main |
| 6A | 6B | main |
| 6A | Merge 1 (index 1) | main |
| 6B | 6C | main |
| 6B | Merge 1 (index 2) | main |
| 6C | Merge 1 (index 3) | main |
| Merge 1 | 6D | main |
| 6D | 7. IF ERRO | main |
| 7. IF ERRO (true) | 21b | main |
| 7. IF ERRO (false) | 8B | main |
| 8B | 8C | main |
| 8C | Merge 2 | main |
| Merge 2 | 9. Preparar Fatura | main |
| 9 | 12. Gerar Relatorio HTML | main |
| 12 | 10. Criar Fatura | main |
| 10 | 13A. IF Pular | main |
| 13A (pular) | 26. Responder SKIP | main |
| 13A (ok) | 14. Processar Resposta | main |
| 14 | 15. Montar itens | main |
| 15 | 16. Chat Sucesso | main |
| 16 | 17 IF Warning | main |
| 17 (warning) | 18. Chat Warning | main |
| 17 (ok) | Merge | main |
| 18 | Merge | main |
| Merge | Merge1 (index 0) | main |
| Merge1 | 18B. Gravar Supabase | main |
| 18B | 18C | main |
| 18C | 18D | main |
| 18D | 19. Preparar Sheets | main |
| 19 | 20. Append MASTER | main |
| 20 | 21. Responder OK | main |
| 21 Preparar MSG | 22. Chat Erro | main |
| 21b | 22. Chat Erro | main |
| 21b | Merge1 (index 4) | main |
| 22 | 23. Responder ERRO | main |
| 22 | Merge1 (index 3) | main |
