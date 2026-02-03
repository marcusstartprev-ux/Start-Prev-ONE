# NO 6D - REVISOR DE CALCULOS

## Informacoes do No
- **Nome**: 6D. Revisor de Calculos
- **Tipo**: n8n-nodes-base.code
- **Versao**: 5.8
- **Data**: 08/01/2026

---

## OBJETIVO

Validar TODOS os dados recebidos dos nos anteriores, consolidar tags de todos os nos, e decidir se o processo pode continuar (ok=true) ou deve parar (ok=false).

---

## PARA QUE SERVE

1. **Consolidar dados** - Une informacoes de 5 fontes diferentes
2. **Validar CPF/NB** - Compara PDF vs Deal vs 1B
3. **Consolidar tags** - Une tags de 6A, 6B, 6C
4. **Decisao final** - ok=true ou ok=false
5. **Preparar campos finais** - Para criar Invoice

---

## NOS DEPENDENTES (ANTERIORES)

O 6D recebe dados de 5 nos via Merge 1:

| No | Dados Recebidos |
|----|-----------------|
| 5. Gemini Extrair2 | Dados brutos extraidos do PDF |
| 6A. Calculo Historico | cliente, beneficio, creditos, tags_6a |
| 6B. Calculo INSS | resumo, dados, tags_6b, desconto_inss |
| 6C. Calculo Start | parcelas, honorarios, alertas, tags_6c |
| BUSCAR DEAL | Deal completo do Bitrix24 |

---

## NOS QUE DEPENDEM DESTE (POSTERIORES)

| No | Dados Enviados |
|----|----------------|
| 7. IF ERRO | ok (true/false) |
| 8B. Buscar Ultima Invoice | (se ok=true) |
| 21b preparar msg erro | (se ok=false) |

---

## BUSCA DE DADOS

```javascript
// Buscar cada input do Merge
const dados6C = buscarNo('6C. Calculo Start');
const dados6B = buscarNo('6B.Calculo do INSS');
const dados6A = buscarNo('6A. Calculo do Historico de credito (PDF)');
const dadosGemini = buscarNo('5. Gemini Extrair2');
const dados1B = buscarNo('1B. Inicializar');

// Buscar Deal
let dealData = {};
const dadosBuscarDealDireto = buscarNo('BUSCAR DEAL');
if (dadosBuscarDealDireto && dadosBuscarDealDireto.result) {
  dealData = dadosBuscarDealDireto.result;
}
```

---

## MAPEAMENTO DE CAMPOS

### Campos do Deal (CD)

```javascript
const CD = {
  cpf: 'UF_CRM_5F7DD07B0ADB5',
  nb: 'UF_CRM_1737470444334',
  nit: 'UF_CRM_1766282969',
  mr_cliente: 'UF_CRM_1741726157749',
  dib: 'UF_CRM_1765928945',
  dip: 'UF_CRM_1766439387',
  dcb: 'UF_CRM_1748433331869',
  banco: 'UF_CRM_1603216440272',
  assessor: 'UF_CRM_5F7DD07AEC035',
  // ... 38 campos totais
};
```

### Campos da Invoice (CI)

```javascript
const CI = {
  cpf: 'UF_CRM_652439CFE551C',
  nb: 'UF_CRM_6790DAD756E3C',
  nit: 'UF_CRM_6947602572F0A',
  mr_cliente: 'UF_CRM_67D19072D84A8',
  dib: 'UF_CRM_69442F085B2CD',
  valor_total_start: 'UF_CRM_69442F217FB9D',
  saldo_restante_start: 'UF_CRM_69442F27CCFB3',
  regra_aplicada: 'UF_CRM_69442F5F762AD',
  assessor: 'UF_CRM_681E47094F79F',
  // ... 57 campos totais
};
```

---

## VALIDACAO CPF/NB - DETALHAMENTO

### Fontes de CPF/NB

1. **1B. Inicializar** - CPF/NB enviados pelo webhook (fonte confiavel)
2. **Deal (Bitrix)** - CPF/NB cadastrados no negocio
3. **PDF (Gemini/6A)** - CPF/NB extraidos do documento

### Normalizacao

```javascript
const normalizarCPF = (cpf) => {
  if (!cpf) return '';
  const digits = String(cpf).replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits.length <= 11) return digits.padStart(11, '0');
  return digits.slice(-11);
};

const normalizarNB = (nb) => {
  if (!nb) return '';
  return String(nb).replace(/\D/g, '');
};
```

### Validacao

```javascript
// CPF do PDF vs CPF do Deal
const cpfPDF = normalizarCPF(dados6A.cliente?.cpf);
const cpfDeal = normalizarCPF(dealData[CD.cpf]);

if (cpfPDF && cpfDeal && cpfPDF !== cpfDeal) {
  // ERRO CRITICO: CPF do PDF diferente do Deal!
  erros.push({
    tag: 'E_CPF_PDF_DIFERENTE_DEAL',
    mensagem: `CPF PDF (${cpfPDF}) != CPF Deal (${cpfDeal})`,
    severidade: 'CRITICO'
  });
}

// NB do PDF vs NB do Deal
const nbPDF = normalizarNB(dados6A.beneficio?.nb);
const nbDeal = normalizarNB(dealData[CD.nb]);

if (nbPDF && nbDeal && nbPDF !== nbDeal) {
  // ERRO CRITICO: NB do PDF diferente do Deal!
  erros.push({
    tag: 'E_NB_PDF_DIFERENTE_DEAL',
    mensagem: `NB PDF (${nbPDF}) != NB Deal (${nbDeal})`
  });
}
```

---

## CONSOLIDACAO DE TAGS

### Processamento de Tags

```javascript
// Tags do 6A v7.1 (usa "severidade" CRIT)
const tags_6a_raw = dados6A.tags || [];
const tags_6a = tags_6a_raw.map(t => {
  if (typeof t === 'object' && t.severidade === 'CRIT') {
    return { ...t, severidade: 'CRITICO' };
  }
  return typeof t === 'string' ? t : (t.codigo || t);
});

// Tags do 6B v6.5 (usa "nivel")
const tags_6b_raw = dados6B.tags || [];
const tags_6b = tags_6b_raw.map(t => {
  if (typeof t === 'object' && t.nivel === 'CRITICO') {
    return { ...t, severidade: 'CRITICO' };
  }
  return typeof t === 'string' ? t : (t.tag || t);
});

// Tags do 6C
const tags_6c_raw = ctx.tags || [];
```

### Contagem de Tags

```javascript
const contarTagsCriticas = (tags) => {
  return tags.filter(t => {
    if (typeof t === 'object') {
      return t.severidade === 'CRITICO' || t.nivel === 'CRITICO';
    }
    return false;
  }).length;
};

const totalCritico = contarTagsCriticas(tags_6a) +
                     contarTagsCriticas(tags_6b) +
                     contarTagsCriticas(tags_6c);

const podeFaturar = totalCritico === 0;
```

---

## ERROS VALIDADOS

| Codigo | Tag | Descricao |
|--------|-----|-----------|
| E01 | E_CPF_PDF_DIFERENTE_DEAL | CPF do PDF != CPF do Deal |
| E02 | E_NB_PDF_DIFERENTE_DEAL | NB do PDF != NB do Deal |
| E03 | E_CPF_AUSENTE | CPF nao encontrado |
| E04 | E_NB_AUSENTE | NB nao encontrado |
| E05 | E_MR_ZERO | MR zerada |
| E06 | E_SEM_PARCELAS | Nenhuma parcela calculada |
| E07 | E_HONORARIOS_ZERO | Honorarios = 0 |
| E08 | E_DATA_INVALIDA | Data de pagamento invalida |
| E09 | E_6A_ERRO | Erro recebido do 6A |
| E10 | E_6B_ERRO | Erro recebido do 6B |
| E11 | E_6C_ERRO | Erro recebido do 6C |

---

## DADOS EXTRAIDOS

### Contact ID e Assessor

```javascript
// V5.6: Extrair contact_id e assessor do Deal
const contactId = dealData.CONTACT_ID || dealData.contact_id || null;
const assessorDeal = dealData[CD.assessor] || null;
```

### Campos Consolidados

```javascript
// Prioridade de dados: 6C > 6B > 6A > Deal > 1B
const resumo = ctx.resumo || dados6B.resumo || {};
const dados = ctx.dados || dados6B.dados || {};
const parcelas = dados.parcelas || [];
const deal = dados.deal || ctx.deal || dados6B.deal || dados6A.deal || {};

const campos_deal = ctx.campos_deal || dados6B.campos_deal || dados6A.campos_deal || {};
const campos_invoice = ctx.campos_invoice_base || dados6B.campos_invoice_base || {};
```

---

## DECISAO FINAL

```javascript
// ok = true se:
// 1. Nao tem erros criticos de validacao
// 2. Tem parcelas calculadas
// 3. Tem honorarios > 0
// 4. CPF/NB do PDF batem com Deal

const ok = erros.filter(e => e.severidade === 'CRITICO').length === 0;

return {
  ok: ok,
  erro: ok ? null : erros[0],
  pode_criar_faturas: ok,
  // ...
};
```

---

## ESTRUTURA DE SAIDA

```javascript
return {
  _no: '6D',
  _versao: '5.8',
  _timestamp: new Date().toISOString(),

  ok: true/false,
  erro: null ou { tag, codigo, mensagem, severidade },
  pode_criar_faturas: true/false,

  validacao: {
    cpf_ok: true/false,
    nb_ok: true/false,
    mr_ok: true/false,
    parcelas_ok: true/false,
    honorarios_ok: true/false
  },

  resumo: {
    nome: "Maria Silva",
    cpf: "12345678900",
    cpf_formatado: "123.456.789-00",
    nb: "1234567890",
    nb_formatado: "123.456.789-0",
    deal_id: 12345,
    contact_id: 67890,
    assessor: 123,
    mr: 1518.00,
    honorarios_start: 1685.00,
    parcelas_total: 4
  },

  dados: {
    deal_id: 12345,
    deal: { ... },
    cliente: { ... },
    beneficio: { ... },
    parcelas: [...],
    parcelas_projetadas: [...],
    situacao_financeira: { ... }
  },

  auditoria: {
    fontes_dados: ['6A', '6B', '6C', 'DEAL', '1B'],
    tags_6a: [...],
    tags_6b: [...],
    tags_6c: [...],
    alertas_6a: [...],
    alertas_6b: [...],
    alertas_6c: [...],
    total_tags_critico: 0,
    total_alertas: 5
  },

  campos_deal: { ... },
  campos_invoice_base: { ... },

  CAMPOS_DEAL_IDS: CD,
  CAMPOS_INVOICE_IDS: CI
};
```

---

## REGRAS DE NEGOCIO IMPORTANTES

1. **Validacao PDF vs Deal SEPARADA**
   - CPF do PDF comparado com CPF do Deal
   - NB do PDF comparado com NB do Deal
   - Se diferente, erro CRITICO

2. **Consolidacao hierarquica de dados**
   - 6C tem prioridade sobre 6B
   - 6B tem prioridade sobre 6A
   - 6A tem prioridade sobre Deal

3. **Contact_id e Assessor no output**
   - Necessarios para criar Invoice vinculada
   - Herdados do Deal

4. **Filosofia: Validar TUDO**
   - O 6D e o ultimo checkpoint antes de criar faturas
   - Se algo passou despercebido nos nos anteriores, 6D deve pegar

5. **Log de auditoria completo**
   - Registra todas as fontes de dados
   - Registra todas as tags de todos os nos
   - Facilita debug e rastreabilidade
