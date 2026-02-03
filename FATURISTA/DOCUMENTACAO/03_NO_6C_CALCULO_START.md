# NO 6C - CALCULO START (HONORARIOS)

## Informacoes do No
- **Nome**: 6C. Calculo Start
- **Tipo**: n8n-nodes-base.code
- **Versao**: 3.2
- **Data**: 19/01/2026

---

## OBJETIVO

Calcular os honorarios da Start Assessoria (30% do beneficio), aplicando regras de faixas progressivas e garantindo que o cliente sempre fique com no minimo 50% de cada parcela.

---

## PARA QUE SERVE

1. **Calcular honorarios Start** - 30% do valor total do beneficio
2. **Aplicar faixas de cobranca** - 30% a 45% por parcela
3. **Garantir regra dos 50%** - Cliente sempre fica com >= 50%
4. **Ratear DARF** - Se Start paga DARF, cliente reembolsa
5. **Projetar quitacao** - Determinar parcela de quitacao

---

## NOS DEPENDENTES (ANTERIORES)

| No | Dados Recebidos |
|----|-----------------|
| 6B. Calculo INSS | resumo, dados, parcelas_projetadas, mr, aliquota_efetiva |

---

## NOS QUE DEPENDEM DESTE (POSTERIORES)

| No | Dados Enviados |
|----|----------------|
| Merge 1 | parcelas, resumo, honorarios_start |
| 6D. Revisor | alertas, tags_sucesso |

---

## CONFIGURACOES

```javascript
const CONFIG = {
  ALIQUOTA_HONORARIOS: 0.30,     // 30% do beneficio total
  FAIXAS: [
    { min: 2000, aliquota: 0.45, nome: 'FAIXA_45' },  // >= R$ 2000
    { min: 1500, aliquota: 0.40, nome: 'FAIXA_40' },  // >= R$ 1500
    { min: 700,  aliquota: 0.35, nome: 'FAIXA_35' },  // >= R$ 700
    { min: 0,    aliquota: 0.30, nome: 'FAIXA_30' }   // < R$ 700
  ],
  MINIMO_CLIENTE: 0.50,          // 50% minimo para cliente
  PARCELA_BAIXA_LIMITE: 100,     // Alerta se parcela < R$ 100
  MUITAS_PARCELAS_LIMITE: 5,     // Alerta se > 5 parcelas
  MARGEM_APERTADA_LIMITE: 0.55   // Alerta se cliente fica com < 55%
};
```

---

## CALCULO DE HONORARIOS - DETALHAMENTO

### Passo 1: Base de Honorarios

```javascript
// Soma todos os valores liquidos (extrato + projetadas)
let totalHonorariosBase = 0;
for (const p of parcelasAgrupadas) {
  totalHonorariosBase += p.valor;
}

// Honorarios Start = 30% do total
// Arredondado para BAIXO (sem centavos)
const honorariosStart = Math.floor(totalHonorariosBase * 0.30);
```

### Exemplo

```
Total Beneficio (liquido): R$ 5617.20
Honorarios Start: R$ 5617.20 x 30% = R$ 1685.16
Arredondado: R$ 1685 (sem centavos)
```

---

## FAIXAS DE COBRANCA POR PARCELA

A Start nao cobra 30% de cada parcela. A faixa depende do VALOR DA PARCELA:

| Valor Parcela | Aliquota | Exemplo |
|---------------|----------|---------|
| >= R$ 2000 | 45% | Parcela R$ 2500 -> Start recebe ate R$ 1125 |
| >= R$ 1500 | 40% | Parcela R$ 1800 -> Start recebe ate R$ 720 |
| >= R$ 700 | 35% | Parcela R$ 1000 -> Start recebe ate R$ 350 |
| < R$ 700 | 30% | Parcela R$ 500 -> Start recebe ate R$ 150 |

### Funcao de Calculo por Faixa

```javascript
const calcularPorFaixa = (valorParcela, saldoStart) => {
  const faixa = obterFaixa(valorParcela);

  // Valor maximo que Start pode receber nesta parcela
  let valorStart = Math.floor(valorParcela * faixa.aliquota);

  // Nao pode receber mais que o saldo restante
  if (valorStart > saldoStart) valorStart = saldoStart;

  // Garantir que cliente fique com >= 50%
  const clienteFicaCom = valorParcela - valorStart;
  const minimoCliente = valorParcela * 0.50;

  if (clienteFicaCom < minimoCliente) {
    // Ajusta para cliente ficar com 50%
    valorStart = Math.floor(valorParcela - minimoCliente);
  }

  return { valorStart, faixa: faixa.nome, aliquota: faixa.aliquota };
};
```

---

## REGRA DOS 50% - DETALHAMENTO

### Objetivo
O cliente SEMPRE deve ficar com no minimo 50% de cada parcela.

### Logica

```javascript
// Para cada parcela:
const valorParcela = 1400.00;
const valorStartDesejado = 1400 * 0.40 = 560;  // Faixa 40%
const clienteFicariaCom = 1400 - 560 = 840;    // 60% -> OK!

// Outro exemplo:
const valorParcela = 800.00;
const valorStartDesejado = 800 * 0.35 = 280;   // Faixa 35%
const clienteFicariaCom = 800 - 280 = 520;     // 65% -> OK!

// Caso limite:
const valorParcela = 500.00;
const saldoStart = 300.00;  // Start ainda precisa receber R$ 300
const valorStartDesejado = 300;                 // Quer quitar
const clienteFicariaCom = 500 - 300 = 200;      // 40% -> VIOLA REGRA!
// Ajuste: Start recebe 250, cliente fica com 250 (50%)
```

---

## REGRA DA DARF - DETALHAMENTO

### O que e DARF?
DARF (Documento de Arrecadacao de Receitas Federais) e uma guia de imposto que as vezes a Start paga pelo cliente.

### Como Funciona

```javascript
// Campo no Deal: "Necessita de DARF?"
// Opcoes: "Sim! Start ira pagar!" ou "Nao"

if (startPagaDarf && valorDarf > 0) {
  // DARF e ADIANTAMENTO que Start faz
  // Cliente precisa DEVOLVER esse valor

  // 1. DARF SOMADA ao valor_start (aumenta recebimento Start)
  // 2. DARF SUBTRAIDA do valor_cliente (diminui recebimento cliente)
  // 3. DARF NAO afeta regra dos 50% (calculada ANTES)
  // 4. DARF e rateada nas parcelas onde Start recebe
}
```

### Exemplo com DARF

```
Parcela: R$ 1400
Honorarios Start: R$ 560 (40%)
Cliente ficaria com: R$ 840 (60%)

DARF: R$ 100 (dividido em 2 parcelas = R$ 50 cada)

Com DARF:
- Start recebe: R$ 560 + R$ 50 = R$ 610
- Cliente recebe: R$ 840 - R$ 50 = R$ 790
```

---

## QUITACAO

### Definicao
Quitacao ocorre quando o saldo devedor da Start e zerado.

### Logica

```javascript
const podeQuitar = (valorParcela, saldoStart) => {
  // Pode quitar se, apos pagar o saldo, cliente ainda fica com >= 50%
  const clienteFicaCom = valorParcela - saldoStart;
  const minimoCliente = valorParcela * 0.50;
  return clienteFicaCom >= minimoCliente;
};
```

### Exemplo

```
Saldo Start: R$ 400
Parcela: R$ 1400
Se Start receber R$ 400, cliente fica com R$ 1000 (71%)
71% >= 50% -> PODE QUITAR!

Saldo Start: R$ 800
Parcela: R$ 1000
Se Start receber R$ 800, cliente fica com R$ 200 (20%)
20% < 50% -> NAO PODE QUITAR!
// Aplica faixa normal
```

---

## SISTEMA DE ERROS

```javascript
const ERROS = {
  E_INPUT_NULO: 'Input do 6B veio nulo/undefined',
  E_INPUT_OK_FALSE: '6B retornou ok=false',
  E_SEM_RESUMO: 'Campo resumo ausente no input',
  E_SEM_DADOS: 'Campo dados ausente no input',
  E_SEM_DEAL: 'Deal nao veio do 6B',
  E_SEM_CREDITOS: 'Nenhum credito no extrato',
  E_SEM_PARCELAS: 'Nenhuma parcela (extrato + projetadas)',
  E_TOTAL_120_ZERO: 'Total 120 dias = 0',
  E_TOTAL_120_NEGATIVO: 'Total 120 dias < 0',
  E_MR_ZERO: 'MR veio zerado',
  E_HONORARIOS_ZERO: 'Honorarios calculados = 0',
  E_PARCELA_SEM_DATA: 'Parcela sem data de pagamento',
  E_PARCELA_SEM_VALOR: 'Parcela com valor 0'
};
```

---

## ALERTAS

```javascript
const ALERTAS = {
  'ALERTA_ALIQUOTA_INSS_NAO_VEIO_6B': 'Aliquota INSS nao veio do 6B, usando 7.5%',
  'ALERTA_EXTRATO_SEM_CREDITOS': 'Extrato sem creditos, usando apenas projecoes',
  'ALERTA_REPROCESSAMENTO': 'Reprocessamento detectado (saldo Start ja existe)',
  'ALERTA_PARCELA_BAIXA': 'Parcela com valor baixo',
  'ALERTA_MARGEM_50_APERTADA': 'Margem 50% apertada',
  'ALERTA_DATA_RETROATIVA': 'Data de pagamento retroativa',
  'ALERTA_REGRA_50_VIOLADA': 'Regra 50% violada em parcela',
  'ALERTA_DARF_START_PAGA': 'DARF adicionada aos honorarios Start'
};
```

---

## ESTRUTURA DE SAIDA

```javascript
return {
  _no: '6C',
  _versao: '3.2',
  ok: true/false,

  tags_sucesso: [...],
  alertas: [...],
  info: [...],

  resumo: {
    nome: "Maria Silva",
    cpf: "12345678900",
    nb: "1234567890",
    deal_id: 12345,
    mr: 1518.00,
    total_beneficio: 5617.20,
    honorarios_start: 1685.00,
    aliquota_start: 0.30,
    parcelas_total: 4,
    parcela_quitacao: 3,
    darf: { necessita: true, valor: 100, start_paga: true }
  },

  dados: {
    deal_id: 12345,
    deal: { ... },
    parcelas: [
      {
        numero: 1,
        data_pagamento: "2026-01-27",
        valor_parcela: 1404.15,
        valor_start: 561.00,
        valor_darf_rateado: 50.00,
        valor_start_total: 611.00,
        valor_cliente: 793.15,
        saldo_antes: 1685.00,
        saldo_depois: 1124.00,
        regra_aplicada: "FAIXA_40",
        percentual_cliente: 0.56
      },
      // ... demais parcelas
    ]
  },

  campos_deal: { ... },
  campos_invoice_base: { ... }
};
```

---

## EXEMPLO COMPLETO DE CALCULO

```
ENTRADA:
- MR: R$ 1518.00
- Desconto INSS: R$ 113.85
- Liquido Mensal: R$ 1404.15
- Total 120 dias: R$ 5617.20
- Parcelas: 4 (jan, fev, mar, abr)

CALCULO HONORARIOS:
- Base: R$ 5617.20
- Honorarios Start: R$ 5617.20 x 30% = R$ 1685 (truncado)

PARCELA 1 (R$ 1404.15):
- Faixa: >= R$ 700 = 35%
- Maximo Start: R$ 1404.15 x 35% = R$ 491
- Saldo Start: R$ 1685 (precisa receber)
- Valor Start: R$ 491 (menor que saldo)
- Cliente: R$ 1404.15 - R$ 491 = R$ 913.15 (65%)
- Saldo apos: R$ 1685 - R$ 491 = R$ 1194

PARCELA 2 (R$ 1404.15):
- Faixa: 35%
- Valor Start: R$ 491
- Cliente: R$ 913.15 (65%)
- Saldo apos: R$ 1194 - R$ 491 = R$ 703

PARCELA 3 (R$ 1404.15):
- Faixa: 35%
- Saldo: R$ 703
- PODE QUITAR? R$ 1404 - R$ 703 = R$ 701 (50%) -> SIM!
- Valor Start: R$ 703 (QUITACAO)
- Cliente: R$ 701.15 (50%)
- Saldo apos: R$ 0

PARCELA 4 (R$ 1404.15):
- Saldo: R$ 0 -> QUITADO
- Valor Start: R$ 0
- Cliente: R$ 1404.15 (100%)
```

---

## REGRAS DE NEGOCIO IMPORTANTES

1. **Valores REAIS do extrato**
   - Base de honorarios usa valor_liquido REAL do PDF
   - Nao usa valor teorico calculado

2. **Arredondamento para BAIXO**
   - Honorarios Start sempre truncados (sem centavos)
   - Favorece o cliente

3. **DARF calculada DEPOIS da regra 50%**
   - Regra 50% aplicada sobre honorarios
   - DARF e adicao separada

4. **Quitacao pode ocorrer em qualquer parcela**
   - Depende do saldo restante
   - Depende do valor da parcela
