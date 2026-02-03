# NO 6B - CALCULO DO INSS

## Informacoes do No
- **Nome**: 6B. Calculo do INSS
- **Tipo**: n8n-nodes-base.code
- **Versao**: 6.5
- **Data**: 29/01/2026

---

## OBJETIVO

Calcular os descontos de INSS aplicando as faixas progressivas oficiais, determinar datas de pagamento usando o calendario oficial do INSS e projetar parcelas futuras.

---

## PARA QUE SERVE

1. **Calcular desconto INSS progressivo** - Aplica faixas de 7.5% a 14%
2. **Determinar calendario de pagamentos** - Por digito do NB
3. **Projetar parcelas futuras** - Quando beneficio nao esta completo
4. **Calcular valores derivados** - Liquido mensal, valor diario
5. **Validar consistencia** - 120 dias maximo, pulos de mes

---

## NOS DEPENDENTES (ANTERIORES)

| No | Dados Recebidos |
|----|-----------------|
| 6A. Calculo Historico | cliente, beneficio, creditos, cobertura |

---

## NOS QUE DEPENDEM DESTE (POSTERIORES)

| No | Dados Enviados |
|----|----------------|
| 6C. Calculo Start | resumo, dados, parcelas_projetadas |
| Merge 1 | Todos os dados de calculo |
| 6D. Revisor | tags, resumo_tags |

---

## CONSTANTES OFICIAIS

### Salario Minimo por Ano

```javascript
const SALARIO_MINIMO = {
  2024: 1412.00,
  2025: 1518.00,
  2026: 1621.00
};
```

### Faixas INSS Progressivas

```javascript
const FAIXAS_INSS = {
  2025: [
    { limite: 1518.00, aliquota: 7.5 },   // Faixa 1: 0 a 1518
    { limite: 2793.88, aliquota: 9.0 },   // Faixa 2: 1518.01 a 2793.88
    { limite: 4190.83, aliquota: 12.0 },  // Faixa 3: 2793.89 a 4190.83
    { limite: 8157.41, aliquota: 14.0 }   // Faixa 4: 4190.84 a 8157.41 (teto)
  ],
  2026: [
    { limite: 1621.00, aliquota: 7.5 },
    { limite: 2923.61, aliquota: 9.0 },
    { limite: 4386.05, aliquota: 12.0 },
    { limite: 8537.55, aliquota: 14.0 }
  ]
};
```

---

## CALCULO INSS PROGRESSIVO - DETALHAMENTO

### Formula

O desconto INSS e calculado de forma PROGRESSIVA (nao linear):

```
Para MR = R$ 3000,00 (ano 2025):

Faixa 1: R$ 1518,00 x 7.5% = R$ 113,85
Faixa 2: (R$ 2793,88 - R$ 1518,00) x 9.0% = R$ 1275,88 x 9% = R$ 114,83
Faixa 3: (R$ 3000,00 - R$ 2793,88) x 12.0% = R$ 206,12 x 12% = R$ 24,73

TOTAL INSS = R$ 113,85 + R$ 114,83 + R$ 24,73 = R$ 253,41
Aliquota Efetiva = R$ 253,41 / R$ 3000,00 = 8,45%
```

### Funcao de Calculo

```javascript
const calcularDescontoINSS = (mr, ano = 2025) => {
  const faixas = getFaixasINSS(ano);
  let descontoTotal = 0;
  let baseAnterior = 0;
  const detalhes = [];

  for (const faixa of faixas) {
    if (mr <= baseAnterior) break;

    // Base de calculo = parte do salario nesta faixa
    const baseCalculo = Math.min(mr, faixa.limite) - baseAnterior;

    if (baseCalculo > 0) {
      // Aplica aliquota da faixa
      const descontoFaixa = baseCalculo * faixa.aliquota / 100;
      descontoTotal += descontoFaixa;

      detalhes.push({
        faixa: detalhes.length + 1,
        limite: faixa.limite,
        aliquota: faixa.aliquota,
        base_calculo: baseCalculo,
        desconto: descontoFaixa
      });
    }

    baseAnterior = faixa.limite;
  }

  // Truncar (INSS usa truncamento, nao arredondamento!)
  descontoTotal = Math.floor(descontoTotal * 100) / 100;
  const aliquotaEfetiva = (descontoTotal / mr) * 100;

  return { desconto: descontoTotal, aliquota_efetiva: aliquotaEfetiva, detalhes };
};
```

### IMPORTANTE: Truncamento

O INSS usa **TRUNCAMENTO**, nao arredondamento:
```javascript
const tr = (v) => Math.floor((v || 0) * 100) / 100;
// 113.856 -> 113.85 (nao 113.86)
```

---

## CALENDARIO INSS - DETALHAMENTO

### Como Funciona

O INSS paga beneficios em datas diferentes baseado no:
1. **Ultimo digito do NB** (Numero do Beneficio)
2. **Faixa salarial** (ate 1 SM ou acima)
3. **Competencia** (mes de referencia)

### Extrair Digito do Calendario

```javascript
const extrairDigitoCalendario = (nb) => {
  const numeros = String(nb).replace(/\D/g, '');
  // Penultimo digito determina o calendario
  return numeros.length >= 2 ? numeros[numeros.length - 2] : '1';
};
```

### Exemplo de Calendario 2025 (Ate 1 SM)

```javascript
const CALENDARIO_ATE_1SM_2025 = {
  '1': {  // NB termina em X1X
    'jan/25': '2025-01-27',
    'fev/25': '2025-02-24',
    'mar/25': '2025-03-25',
    // ...
  },
  '2': {  // NB termina em X2X
    'jan/25': '2025-01-28',
    'fev/25': '2025-02-25',
    // ...
  },
  // ... digitos 3-9 e 0
};
```

### Exemplo de Calendario 2025 (Acima de 1 SM)

```javascript
const CALENDARIO_ACIMA_1SM_2025 = {
  '1': {  // NB termina em X1X
    'jan/25': '2025-02-03',
    'fev/25': '2025-03-06',
    // ...
  },
  // ...
};
```

### Funcao para Obter Data de Pagamento

```javascript
const obterDataPagamentoPorMes = (nb, mesPagamento, anoPagamento, mr) => {
  const digitoCalendario = extrairDigitoCalendario(nb);
  const salarioMinimo = getSalarioMinimo(anoPagamento);
  const faixaMR = mr <= salarioMinimo ? 'ATE_1SM' : 'ACIMA_1SM';

  const calendario = getCalendario(anoPagamento, faixaMR);
  const datas = calendario[digitoCalendario];

  // Busca data que cai no mes solicitado
  for (const [chaveComp, dataPagamento] of Object.entries(datas)) {
    if (dataPagamento.startsWith(`${anoPagamento}-${String(mesPagamento).padStart(2, '0')}`)) {
      return {
        data_pagamento: dataPagamento,
        origem: 'CALENDARIO_OFICIAL',
        erro: false
      };
    }
  }

  // V6.5: NAO FAZ FALLBACK! Retorna erro critico
  return {
    data_pagamento: null,
    origem: 'NAO_ENCONTRADA',
    erro: true,
    tag: 'CRITICO_DATA_NAO_ENCONTRADA'
  };
};
```

---

## SISTEMA DE TAGS (CRITICIDADE)

### Niveis

```javascript
const NIVEIS_CRITICIDADE = {
  OK: { ordem: 0, emoji: 'verde', descricao: 'Tudo certo, pode faturar' },
  INFO: { ordem: 1, emoji: 'info', descricao: 'Informativo, nao afeta calculo' },
  AVISO: { ordem: 2, emoji: 'warning', descricao: 'Atencao, revisar depois' },
  CRITICO: { ordem: 3, emoji: 'vermelho', descricao: 'Erro de calculo provavel, NAO faturar' }
};
```

### Tags Definidas

| Tag | Codigo | Nivel | Descricao |
|-----|--------|-------|-----------|
| OK_CALCULO_COMPLETO | S01 | OK | Calculo completo e confiavel |
| OK_PROJECAO_CONFIAVEL | S02 | OK | Projecao com calendario oficial |
| OK_QUITACAO | S03 | OK | 120 dias completos |
| INFO_PRIMEIRA_PARCELA | I01 | INFO | Primeira parcela do beneficio |
| INFO_TEM_13O | I02 | INFO | 13o salario detectado |
| AVISO_QUASE_COMPLETO | A01 | AVISO | Faltam <= 15 dias |
| AVISO_VALOR_BAIXO | A02 | AVISO | Parcela < R$100 |
| CRITICO_MR_VAZIO | C01 | CRITICO | MR vazio |
| CRITICO_NB_VAZIO | C03 | CRITICO | NB vazio |
| CRITICO_DIB_VAZIO | C04 | CRITICO | DIB vazia |
| CRITICO_DATA_NAO_ENCONTRADA | C06 | CRITICO | Data nao encontrada |
| CRITICO_DIAS_EXCEDIDOS | C09 | CRITICO | Mais de 120 dias |

---

## PROJECAO DE PARCELAS FUTURAS

Quando o beneficio ainda nao esta completo (menos de 120 dias), o 6B projeta as parcelas futuras:

```javascript
// Exemplo: Beneficio com 90 dias pagos, faltam 30 dias

// Proxima parcela projetada:
{
  numero: 4,
  competencia: "02/2026",
  dias: 30,
  data_pagamento_prevista: "2026-02-25",
  valor_bruto: 1518.00,
  desconto_inss: 113.85,
  valor_liquido: 1404.15,
  origem: "PROJETADA"
}
```

---

## VALORES DERIVADOS

```javascript
const calcularValoresDerivados = (mr, descontoINSS) => {
  const liquidoMensal = mr - descontoINSS;        // Ex: 1518 - 113.85 = 1404.15
  const valorDiarioLiquido = liquidoMensal / 30;   // Ex: 1404.15 / 30 = 46.81
  const total120Dias = valorDiarioLiquido * 120;   // Ex: 46.81 * 120 = 5617.20

  return {
    liquido_mensal: liquidoMensal,
    valor_diario_liquido: valorDiarioLiquido,
    total_120_dias: total120Dias
  };
};
```

---

## ESTRUTURA DE SAIDA

```javascript
return {
  _no: '6B',
  _versao: '6.5',
  ok: true/false,

  resumo: {
    nome: "Maria Silva",
    cpf: "12345678900",
    nb: "1234567890",
    deal_id: 12345,
    mr: 1518.00,
    desconto_inss: 113.85,
    aliquota_efetiva: 7.5,
    liquido_mensal: 1404.15,
    valor_diario: 46.81,
    total_120_dias: 5617.20,
    digito_calendario: "3",
    faixa_mr: "ATE_1SM"
  },

  dados: {
    deal_id: 12345,
    deal: { ... },
    cliente: { ... },
    beneficio: { ... },
    creditos: [...],
    parcelas_projetadas: [...],
    situacao_financeira: { ... }
  },

  tags: [...],
  resumo_tags: {
    total_ok: 5,
    total_info: 2,
    total_aviso: 0,
    total_critico: 0,
    maior_criticidade: 'OK',
    pode_faturar: true
  },

  campos_deal: { ... },
  campos_invoice_base: { ... }
};
```

---

## REGRAS DE NEGOCIO IMPORTANTES

1. **MR usa valor ORIGINAL do cliente**
   - Nao forca salario minimo
   - Salario minimo e apenas PISO: `Math.max(mr, minimo)`

2. **SEM fallback de estimativa de data**
   - Se nao encontrar no calendario, marca CRITICO
   - NAO inventa datas!

3. **Sempre passa para 6D**
   - Mesmo com erro critico, passa via Merge
   - 6D decide se bloqueia

4. **Calendario completo 2025 e 2026**
   - 10 digitos (0-9)
   - 2 faixas (ate 1 SM e acima)
   - 12 competencias por ano
