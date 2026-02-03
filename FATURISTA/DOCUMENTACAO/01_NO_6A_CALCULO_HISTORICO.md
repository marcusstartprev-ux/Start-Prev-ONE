# NO 6A - CALCULO DO HISTORICO DE CREDITO (PDF)

## Informacoes do No
- **Nome**: 6A. Calculo do Historico de credito (PDF)
- **Tipo**: n8n-nodes-base.code
- **Versao**: 7.1
- **Data**: 29/01/2026

---

## OBJETIVO

Organizar e validar os dados extraidos do PDF pelo Gemini (no 5), preparando-os para os calculos subsequentes nos nos 6B, 6C e 6D.

---

## PARA QUE SERVE

1. **Parse da resposta do Gemini** - Converter JSON retornado pela IA
2. **Detectar tipo de documento** - EXTRATO_CREDITOS ou PGMEI_DAS
3. **Validar campos obrigatorios** - CPF, NB, MR, DIB, DCB
4. **Normalizar dados** - Formatos de data, valores monetarios
5. **Processar creditos** - Separar pagos, pendentes, cancelados
6. **Calcular cobertura** - Dias cobertos vs 120 dias totais
7. **Preparar campos para Bitrix** - Mapeamento Deal/Invoice

---

## NOS DEPENDENTES (ANTERIORES)

| No | Dados Recebidos |
|----|-----------------|
| 5. Gemini Extrair2 | JSON com dados extraidos do PDF |
| 2C. Analisar Faturas | faturas_existentes, deal_id |
| BUSCAR DEAL | Dados do negocio do Bitrix24 |

---

## NOS QUE DEPENDEM DESTE (POSTERIORES)

| No | Dados Enviados |
|----|----------------|
| 6B. Calculo INSS | cliente, beneficio, creditos, cobertura |
| Merge 1 | Todos os dados processados |
| 6D. Revisor | tags, alertas, erros |

---

## CONFIGURACOES PRINCIPAIS

```javascript
const CONFIG = {
  DIAS_SALARIO_MATERNIDADE: 120,    // Duracao maxima do beneficio
  LIMITE_DIAS_NOVA_PARCELA: 15,     // Margem para considerar completo
  VALOR_BAIXO_ALERTA: 100,          // Valor minimo para alertar
  PERIODO_CURTO_ALERTA: 5,          // Dias minimos para alertar
  MESES_CARENCIA_MEI: 10,           // Meses necessarios para MEI
  SALARIO_MINIMO_2025: 1518.00,     // Piso salarial
  TETO_INSS_2025: 8157.41           // Teto INSS
};
```

---

## SISTEMA DE TAGS (SEVERIDADE)

O no 6A implementa um sistema de TAGs com 5 niveis de severidade:

| Nivel | Emoji | Descricao |
|-------|-------|-----------|
| CRIT | vermelho | Critico - pode pausar para intervencao |
| ALTO | laranja | Alto - alerta forte, revisar manualmente |
| MEDIO | amarelo | Medio - alerta moderado |
| BAIXO | verde | Baixo - apenas registra |
| INFO | azul | Info - log para auditoria |

---

## MAPEAMENTO DE CAMPOS DO DEAL (CD)

```javascript
const CD = {
  // IDENTIFICACAO
  cpf: 'UF_CRM_5F7DD07B0ADB5',
  rg: 'UF_CRM_5F7DD07B11C33',
  nit: 'UF_CRM_1766282969',
  nb: 'UF_CRM_1737470444334',

  // BENEFICIO (Datas)
  dib: 'UF_CRM_1765928945',      // Data Inicio Beneficio
  dip: 'UF_CRM_1766439387',      // Data Inicio Pagamento
  dcb: 'UF_CRM_1748433331869',   // Data Cessacao Beneficio

  // VALORES
  mr_cliente: 'UF_CRM_1741726157749',  // Media Remuneracao

  // BANCO
  banco: 'UF_CRM_1603216440272',
  endereco_banco: 'UF_CRM_1603216499370'
};
```

---

## MAPEAMENTO DE CAMPOS DA INVOICE (CI)

```javascript
const CI = {
  // IDENTIFICACAO
  cpf: 'UF_CRM_652439CFE551C',
  nb: 'UF_CRM_6790DAD756E3C',
  nit: 'UF_CRM_6947602572F0A',

  // BENEFICIO
  dib: 'UF_CRM_69442F085B2CD',
  dip: 'UF_CRM_683860072DEB8',
  dcb: 'UF_CRM_6838600845561',
  mr_cliente: 'UF_CRM_67D19072D84A8',
  valor_diario: 'UF_CRM_69442F466791E',

  // HONORARIOS START
  valor_total_start: 'UF_CRM_69442F217FB9D',
  saldo_restante_start: 'UF_CRM_69442F27CCFB3',
  regra_aplicada: 'UF_CRM_69442F5F762AD',

  // COMPETENCIA
  competencia: 'UF_CRM_691B6450B46E3',
  dias_ja_recebidos: 'UF_CRM_69442F2E321C4',
  dias_restantes: 'UF_CRM_69442F3449D22'
};
```

---

## TABELA DE BANCOS (ENUM)

```javascript
const BANCO_ENUM = {
  'caixa': 4530,
  'banco do brasil': 4532,
  'santander': 4534,
  'bradesco': 431,
  'itau': 433,
  'banrisul': 4536,
  'sicredi': 4544,
  'nubank': ...,  // etc
};
```

---

## FUNCOES PRINCIPAIS

### 1. Parse do Gemini
```javascript
// Extrai JSON da resposta do Gemini
const textoGemini = $json.candidates?.[0]?.content?.parts?.[0]?.text;
let jsonLimpo = textoGemini
  .replace(/```json\n?/gi, '')
  .replace(/```\n?/g, '')
  .trim();
```

### 2. Deteccao de Tipo de Documento
```javascript
function detectarTipoDocumento(dados) {
  // Se tem CNPJ + contribuicoes = PGMEI
  // Se tem NB + MR + DIB = EXTRATO_CREDITOS
}
```

### 3. Processamento de Creditos
```javascript
// Para cada credito do extrato:
- Normaliza competencia (MM/YYYY)
- Calcula dias (periodo_fim - periodo_inicio + 1)
- Extrai valores (bruto, liquido, desconto)
- Determina status (PAGO, PENDENTE, CANCELADO)
- Valida rubricas (101, 104, 110, 137, 206, 215)
```

### 4. Calculo de Cobertura
```javascript
const dias_cobertos = creditosValidos.reduce((sum, c) => sum + c.dias, 0);
const dias_restantes = Math.max(0, 120 - dias_cobertos);
const percentual_coberto = (dias_cobertos / 120) * 100;
```

---

## VALIDACOES REALIZADAS

| Validacao | Tag se Erro | Severidade |
|-----------|-------------|------------|
| CPF presente | TAG_CPF_AUSENTE | CRIT |
| CPF 11 digitos | TAG_CPF_INVALIDO | CRIT |
| NB presente | TAG_NB_AUSENTE | CRIT |
| MR > 0 | TAG_MR_AUSENTE | CRIT |
| MR >= salario minimo | TAG_MR_ABAIXO_MINIMO | ALTO |
| DIB presente | TAG_DIB_AUSENTE | CRIT |
| DIB nao futura | TAG_DIB_FUTURA | ALTO |
| Creditos existem | TAG_CREDITOS_VAZIO | CRIT |
| CPF PDF = CPF Deal | TAG_CPF_DIVERGENTE | CRIT |

---

## ESTRUTURA DE SAIDA

```javascript
return {
  _no: '6A',
  _versao: '7.1',
  _timestamp: new Date().toISOString(),

  ok: true/false,
  tipo_documento: 'EXTRATO_CREDITOS',

  cliente: { nome, cpf, nit },
  beneficio: { nb, especie, mr, dib, dip, dcb, dias_beneficio, valor_diario, banco },
  extrato: { compet_inicial, compet_final, data_atualizacao },

  creditos: [...],           // Todos os creditos validos
  creditos_pagos: [...],     // Status = PAGO
  creditos_pendentes: [...], // Status = PENDENTE
  creditos_invalidos: [...], // Status = CANCELADO

  cobertura: {
    dias_cobertos,
    dias_restantes,
    percentual,
    cobertura_completa: true/false
  },

  campos_deal: { ... },        // Para atualizar Deal
  campos_invoice_base: { ... }, // Para criar Invoice

  tags: [...],                 // Sistema de TAGs
  resumo_tags: { crit, alto, medio, baixo, info },
  tem_problemas_criticos: true/false,
  alertas: [...],
  erros: [...]
};
```

---

## REGRAS DE NEGOCIO IMPORTANTES

1. **Filosofia "Nunca Bloquear"**
   - Mesmo com erros criticos, passa adiante com TAGs
   - O no 6D decide se bloqueia ou nao

2. **Correcao de Dias**
   - Se periodo invertido, corrige automaticamente
   - Se dias informado != calculado, usa calculado
   - Dias nunca pode ser <= 0

3. **DCB Calculada**
   - Se DCB nao veio do PDF, calcula: DIB + 119 dias

4. **DIP Fallback**
   - Se DIP nao veio, usa DIB como fallback

5. **Competencia Auto-Recalculada**
   - Se competencia inicial/final ausente, recalcula dos creditos

---

## EXEMPLO DE CREDITO PROCESSADO

```javascript
{
  id: 1,
  competencia: "01/2026",
  periodo: "01/01/2026 a 31/01/2026",
  periodo_inicio: "2026-01-01",
  periodo_fim: "2026-01-31",
  dias: 31,

  valores: {
    bruto: 1518.00,       // Rubrica 101
    liquido: 1404.15,     // Valor recebido
    desconto_inss: 113.85,// Rubrica 206
    decimo_terceiro: 0,   // Rubrica 104
    arredondamento: 0     // Rubrica 137
  },

  pagamento: {
    previsao: "2026-01-27",
    data: "2026-01-27",
    status: "PAGO",
    status_original: "Pagamento efetivado",
    banco: "CAIXA",
    banco_enum: 4530
  },

  flags: {
    ja_pago: true,
    pode_faturar: true,
    invalidado: false,
    tem_13o: false
  }
}
```
