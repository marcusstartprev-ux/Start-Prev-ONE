'use client';

import { useState, useEffect } from 'react';

// =============================================================================
// HELPERS DE FORMATAÇÃO
// =============================================================================

const fmtBRL = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return "R$ 0,00";
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const fmtPct = (x) => {
  const num = Number(x);
  if (num <= 1) return `${(num * 100).toFixed(0)}%`;
  return `${num.toFixed(0)}%`;
};

const fmtDate = (d) => {
  if (!d) return "—";
  if (typeof d === "string" && d.includes("/")) return d;
  try {
    return new Date(d).toLocaleDateString("pt-BR");
  } catch {
    return d;
  }
};

const fmtCPF = (cpf) => {
  const nums = String(cpf).replace(/\D/g, "");
  if (nums.length !== 11) return cpf;
  return `${nums.slice(0,3)}.${nums.slice(3,6)}.${nums.slice(6,9)}-${nums.slice(9)}`;
};

// =============================================================================
// TABELA DE FAIXAS DE ALÍQUOTA
// =============================================================================

const FAIXAS_ALIQUOTA = [
  { min: 0, max: 2000, aliquota: 0.30, label: "até R$ 2.000" },
  { min: 2000.01, max: 3000, aliquota: 0.30, label: "R$ 2.000 a R$ 3.000" },
  { min: 3000.01, max: 5000, aliquota: 0.35, label: "R$ 3.000 a R$ 5.000" },
  { min: 5000.01, max: 8000, aliquota: 0.40, label: "R$ 5.000 a R$ 8.000" },
  { min: 8000.01, max: Infinity, aliquota: 0.45, label: "acima de R$ 8.000" },
];

const getFaixaAtual = (mr) => {
  return FAIXAS_ALIQUOTA.find(f => mr >= f.min && mr <= f.max);
};

// =============================================================================
// DADOS DE TESTE (será substituído por dados reais via API/props)
// =============================================================================

const DADOS_TESTE = {
  deal_id: 119842,
  status: "SUCESSO",
  versao: "V25",
  timestamp: "31/01/2026 17:42",

  beneficiario: {
    nome: "KARINA INACIO DE OLIVEIRA",
    cpf: "461.743.938-28",
    nit: "167.59266.12-0",
    nb: "240.774.690-7",
    telefone: "(11) 90005-0005",
    responsavel: "Marcus Viniccius",
    banco: "Ag. Previdência Social São Paulo - Ataliba Leonel",
  },

  datas: {
    dib: "05/12/2025",
    dcb: "03/04/2026",
    dip: "05/12/2025",
    duracao: 120,
    especie: "80 - Salário Maternidade",
  },

  financeiro: {
    mr: 1518,
    total_beneficio: 6042.20,
    honorarios_start: 1812.66,
    valor_cliente: 4229.54,
    saldo_restante: 820,
    aliquota: 0.30,
    tem_13o: false,
    valor_13o: 0,
    regra: "PARCELA_NORMAL",
  },

  parcelas_pdf: [
    {
      parcela: 1,
      total_parcelas: 4,
      competencia: "12/2025",
      data_inss: "03/02/2026",
      valor_inss: 1344.00,
      valor_start: 469.00,
      valor_cliente: 875.00,
      aliquota: 0.35,
      regra: "PARCELA_NORMAL",
      invoice_id: 12345,
    },
    {
      parcela: 2,
      total_parcelas: 4,
      competencia: "01/2026",
      data_inss: "06/02/2026",
      valor_inss: 1500.00,
      valor_start: 525.00,
      valor_cliente: 810.00,
      aliquota: 0.35,
      regra: "PARCELA_NORMAL",
      invoice_id: 12346,
    },
  ],

  parcelas_projetadas: [
    {
      parcela: 3,
      total_parcelas: 4,
      competencia: "02/2026",
      data_inss: "06/03/2026",
      valor_inss: 1500.00,
      valor_start: 525.00,
      valor_cliente: 290.00,
      aliquota: 0.35,
      regra: "PARCELA_NORMAL",
      invoice_id: null,
    },
    {
      parcela: 4,
      total_parcelas: 4,
      competencia: "03/2026",
      data_inss: "08/04/2026",
      valor_inss: 698.20,
      valor_start: 293.66,
      valor_cliente: 0,
      aliquota: 0.35,
      regra: "QUITACAO",
      invoice_id: null,
    },
  ],

  explicacoes: [
    {
      icon: "📊",
      titulo: "Por que alíquota 30%?",
      texto: "A Média de Remuneração (MR) é R$ 1.518,00. Conforme tabela de faixas Start, valores até R$ 2.000 aplicam alíquota de 30%."
    },
    {
      icon: "🎯",
      titulo: "Por que regra PARCELA_NORMAL?",
      texto: "O valor INSS de cada parcela não é suficiente para quitar todos os honorários de uma vez, então o sistema distribui a cobrança ao longo das parcelas."
    },
    {
      icon: "📅",
      titulo: "Como são calculadas as datas projetadas?",
      texto: "As datas de pagamento INSS são estimadas com base no calendário oficial do INSS 2026, considerando o último dígito do NB e o valor acima de 1 SM."
    },
    {
      icon: "✅",
      titulo: "Regra dos 50%",
      texto: "Em toda parcela, o cliente retém pelo menos 50% do valor INSS. Se a cobrança exceder esse limite, o sistema ajusta automaticamente."
    },
  ],

  observacoes: [
    "Foram projetadas duas parcelas pois o INSS paga de formas diferentes tanto na primeira quanto na última.",
    "Elas podem ser menores do que o mês cheio ou acumular outra parcela cheia dependendo do início da liberação e o início do pagamento.",
  ],
};

// =============================================================================
// COMPONENTE: Contador Animado
// =============================================================================

const AnimatedCounter = ({ value, prefix = "", suffix = "", duration = 1500 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = typeof value === 'number' ? value : parseFloat(value) || 0;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{prefix}{count.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{suffix}</span>;
};

// =============================================================================
// COMPONENTE: Progresso Circular
// =============================================================================

const CircularProgress = ({ value, size = 100, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (value / 100) * circumference);
    }, 300);
    return () => clearTimeout(timer);
  }, [value, circumference]);

  const color = value === 100 ? "#10b981" : "#fbbf24";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-st-text">{value}%</span>
      </div>
    </div>
  );
};

// =============================================================================
// COMPONENTE: Banner de Status
// =============================================================================

const BannerStatus = ({ status, regra, valorStart, qtdFaturas, saldoRestante }) => {
  const isSuccess = status === "SUCESSO";
  const isQuitacao = regra === "QUITACAO" || saldoRestante <= 0;

  const bgColor = isSuccess
    ? 'bg-gradient-to-r from-st-success/20 to-st-success/5 border-st-success/30'
    : 'bg-gradient-to-r from-st-warning/20 to-st-warning/5 border-st-warning/30';

  const icon = isSuccess ? '🟢' : '🟡';
  const statusText = isSuccess ? 'SUCESSO' : 'ATENÇÃO';
  const regraText = isQuitacao ? 'Quitação' : 'Parcial';

  return (
    <div className={`${bgColor} border rounded-xl p-4 mb-6`}>
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm md:text-base">
        <span className="flex items-center gap-2 font-semibold text-st-text">
          {icon} {statusText}
        </span>
        <span className="text-st-muted">|</span>
        <span className="text-st-text">{regraText}</span>
        <span className="text-st-muted">|</span>
        <span className="text-st-accent font-semibold">Start recebe {fmtBRL(valorStart)}</span>
        <span className="text-st-muted">|</span>
        <span className="text-st-text">{qtdFaturas} fatura(s)</span>
        {saldoRestante > 0 && (
          <>
            <span className="text-st-muted">|</span>
            <span className="text-st-warning">Resta {fmtBRL(saldoRestante)}</span>
          </>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// COMPONENTE: Fluxo Financeiro ("Big Number Story")
// =============================================================================

const FluxoFinanceiro = ({ totalBruto, aliquota, honorarios, saldoRestante, mrMensal }) => {
  const progresso = saldoRestante <= 0 ? 100 : Math.round(((honorarios - saldoRestante) / honorarios) * 100);
  const faixa = getFaixaAtual(mrMensal);

  return (
    <div className="bg-st-surface border border-st-border rounded-xl p-6 mb-6">
      <h2 className="text-lg font-semibold text-st-text mb-6 flex items-center gap-2">
        💰 Fluxo Financeiro
      </h2>

      {/* Big Numbers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Benefício Bruto */}
        <div className="bg-st-bg rounded-xl p-5 text-center border border-st-border">
          <div className="text-xs uppercase tracking-wider text-st-muted mb-2">Benefício Total</div>
          <div className="text-2xl md:text-3xl font-bold text-st-text">
            <AnimatedCounter value={totalBruto} prefix="R$ " />
          </div>
          <div className="text-xs text-st-muted mt-1">120 dias</div>
        </div>

        {/* Seta + Alíquota */}
        <div className="flex flex-col items-center justify-center">
          <div className="hidden md:block text-3xl text-st-muted mb-2">→</div>
          <div className="bg-st-accent/20 border border-st-accent/30 rounded-xl px-6 py-3 text-center">
            <div className="text-xs uppercase tracking-wider text-st-accent mb-1">Alíquota</div>
            <div className="text-3xl font-bold text-st-accent">{fmtPct(aliquota)}</div>
            <div className="text-xs text-st-muted mt-1">{faixa?.label}</div>
          </div>
          <div className="hidden md:block text-3xl text-st-muted mt-2">→</div>
        </div>

        {/* Honorários Start */}
        <div className="bg-st-navy/20 border border-st-navy/30 rounded-xl p-5 text-center">
          <div className="text-xs uppercase tracking-wider text-blue-400 mb-2">Honorários Start</div>
          <div className="text-2xl md:text-3xl font-bold text-blue-400">
            <AnimatedCounter value={honorarios} prefix="R$ " />
          </div>
          <div className="text-xs text-st-muted mt-1">Total a receber</div>
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="bg-st-bg rounded-xl p-4 border border-st-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-st-muted">Progresso da Cobrança</span>
          <span className={`text-sm font-semibold ${progresso === 100 ? 'text-st-success' : 'text-st-accent'}`}>
            {progresso}%
          </span>
        </div>
        <div className="h-3 bg-st-surface rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${progresso === 100 ? 'bg-st-success' : 'bg-st-accent'}`}
            style={{ width: `${progresso}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-st-muted">
          <span>Cobrado: {fmtBRL(honorarios - saldoRestante)}</span>
          <span>Saldo: {fmtBRL(saldoRestante)}</span>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// COMPONENTE: Card de Identificação
// =============================================================================

const CardIdentificacao = ({ beneficiario }) => {
  const { nome, cpf, nit, nb, telefone, responsavel, banco } = beneficiario;

  return (
    <div className="bg-st-surface border border-st-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-st-text mb-4 flex items-center gap-2">
        👤 Identificação
      </h3>

      {/* Nome em destaque */}
      <div className="bg-st-bg rounded-lg p-3 mb-4 border border-st-border">
        <div className="text-xs text-st-muted uppercase tracking-wider mb-1">Nome</div>
        <div className="text-lg font-semibold text-st-accent">{nome}</div>
      </div>

      {/* Grid de dados */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "CPF", value: cpf },
          { label: "NIT", value: nit },
          { label: "NB", value: nb },
          { label: "Telefone", value: telefone },
          { label: "Responsável", value: responsavel },
        ].map((item, i) => (
          <div key={i} className={`${i === 4 ? 'col-span-2' : ''}`}>
            <div className="text-[10px] text-st-muted uppercase tracking-wider">{item.label}</div>
            <div className="text-sm font-mono text-st-text">{item.value || '—'}</div>
          </div>
        ))}
      </div>

      {banco && (
        <div className="mt-3 pt-3 border-t border-st-border">
          <div className="text-[10px] text-st-muted uppercase tracking-wider">Banco</div>
          <div className="text-xs text-st-text">{banco}</div>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// COMPONENTE: Timeline de Vigência
// =============================================================================

const TimelineVigencia = ({ datas, mr, especie }) => {
  const { dib, dip, dcb, duracao } = datas;

  return (
    <div className="bg-st-surface border border-st-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-st-text mb-4 flex items-center gap-2">
        📅 Vigência do Benefício
      </h3>

      {/* Espécie */}
      <div className="bg-st-navy/10 border border-st-navy/20 rounded-lg px-3 py-2 mb-4">
        <div className="text-xs text-blue-400">{especie || "80 - Salário Maternidade"}</div>
      </div>

      {/* Timeline */}
      <div className="relative pl-6 space-y-4">
        {/* Linha vertical */}
        <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-st-border" />

        {/* DIB */}
        <div className="relative">
          <div className="absolute -left-4 w-3 h-3 rounded-full bg-st-success border-2 border-st-bg" />
          <div className="text-[10px] text-st-muted uppercase tracking-wider">DIB (Início)</div>
          <div className="text-sm font-mono font-semibold text-st-text">{dib}</div>
        </div>

        {/* DIP - Destacado */}
        <div className="relative bg-st-accent/10 -mx-2 px-2 py-2 rounded-lg border border-st-accent/20">
          <div className="absolute -left-4 w-3 h-3 rounded-full bg-st-accent border-2 border-st-bg" />
          <div className="text-[10px] text-st-accent uppercase tracking-wider font-semibold">DIP (Pagamento) ⭐</div>
          <div className="text-sm font-mono font-bold text-st-accent">{dip}</div>
        </div>

        {/* DCB */}
        <div className="relative">
          <div className="absolute -left-4 w-3 h-3 rounded-full bg-st-danger border-2 border-st-bg" />
          <div className="text-[10px] text-st-muted uppercase tracking-wider">DCB (Cessação)</div>
          <div className="text-sm font-mono font-semibold text-st-text">{dcb}</div>
        </div>
      </div>

      {/* Info adicional */}
      <div className="mt-4 pt-4 border-t border-st-border grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] text-st-muted uppercase tracking-wider">Duração</div>
          <div className="text-sm font-semibold text-st-text">{duracao} dias</div>
        </div>
        <div>
          <div className="text-[10px] text-st-muted uppercase tracking-wider">MR Mensal</div>
          <div className="text-sm font-semibold text-st-accent">{fmtBRL(mr)}</div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// COMPONENTE: Ticket de Fatura
// =============================================================================

const TicketFatura = ({ fatura, isProjecao = false }) => {
  const { parcela, total_parcelas, competencia, data_inss, valor_inss, valor_start, valor_cliente, aliquota, regra, invoice_id } = fatura;

  const borderStyle = isProjecao ? 'border-dashed border-st-warning/50' : 'border-solid border-st-border';
  const bgStyle = isProjecao ? 'bg-st-warning/5' : 'bg-st-surface';

  return (
    <div className={`${bgStyle} ${borderStyle} border rounded-xl p-4 relative transition-all hover:border-st-accent/50`}>
      {/* Label de Projeção */}
      {isProjecao && (
        <div className="absolute -top-2 left-4 bg-st-warning text-st-bg text-[10px] font-bold px-2 py-0.5 rounded">
          PROJEÇÃO
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${isProjecao ? 'bg-st-warning/20 text-st-warning' : 'bg-st-accent/20 text-st-accent'}`}>
            {parcela}/{total_parcelas}
          </div>
          <div>
            <div className="text-xs text-st-muted">Competência</div>
            <div className="font-semibold text-st-text">{competencia}</div>
          </div>
        </div>
        {regra === "QUITACAO" && (
          <span className="bg-st-success/20 text-st-success text-xs font-semibold px-2 py-1 rounded">
            🎯 QUITAÇÃO
          </span>
        )}
      </div>

      {/* Valores */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-st-bg rounded-lg p-2 text-center">
          <div className="text-[10px] text-st-muted uppercase">INSS</div>
          <div className="text-sm font-mono font-semibold text-st-text">{fmtBRL(valor_inss)}</div>
        </div>
        <div className="bg-st-accent/10 rounded-lg p-2 text-center">
          <div className="text-[10px] text-st-accent uppercase">Start</div>
          <div className="text-sm font-mono font-semibold text-st-accent">{fmtBRL(valor_start)}</div>
        </div>
        <div className="bg-st-success/10 rounded-lg p-2 text-center">
          <div className="text-[10px] text-st-success uppercase">Cliente</div>
          <div className="text-sm font-mono font-semibold text-st-success">{fmtBRL(valor_cliente)}</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-st-muted">📅 INSS: {data_inss}</span>
        {invoice_id ? (
          <a
            href={`https://startprev.bitrix24.com.br/crm/type/31/details/${invoice_id}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
          >
            🔗 Ver no Bitrix
          </a>
        ) : (
          <span className="text-st-muted italic">Aguardando criação</span>
        )}
      </div>
    </div>
  );
};

// =============================================================================
// COMPONENTE: Seção de Explicações
// =============================================================================

const SecaoExplicacoes = ({ explicacoes }) => {
  if (!explicacoes || explicacoes.length === 0) return null;

  return (
    <div className="bg-st-surface border border-st-border rounded-xl p-5 mb-6">
      <h3 className="text-sm font-semibold text-st-text mb-4 flex items-center gap-2">
        💡 Explicações das Decisões
      </h3>
      <div className="grid md:grid-cols-2 gap-3">
        {explicacoes.map((exp, i) => (
          <div key={i} className="bg-st-bg border border-st-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{exp.icon}</span>
              <h4 className="font-semibold text-st-text text-sm">{exp.titulo}</h4>
            </div>
            <p className="text-xs text-st-muted leading-relaxed">{exp.texto}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// =============================================================================
// COMPONENTE: Observações
// =============================================================================

const SecaoObservacoes = ({ observacoes }) => {
  if (!observacoes || observacoes.length === 0) return null;

  return (
    <div className="bg-st-warning/5 border border-st-warning/20 rounded-xl p-5 mb-6">
      <h3 className="text-sm font-semibold text-st-warning mb-3 flex items-center gap-2">
        ⚠️ Observações Importantes
      </h3>
      <ul className="space-y-2">
        {observacoes.map((obs, i) => (
          <li key={i} className="text-xs text-st-muted flex items-start gap-2">
            <span className="text-st-warning mt-0.5">•</span>
            {obs}
          </li>
        ))}
      </ul>
    </div>
  );
};

// =============================================================================
// COMPONENTE: Botão WhatsApp
// =============================================================================

const BotaoWhatsApp = ({ dados }) => {
  const [copiado, setCopiado] = useState(false);

  const gerarTextoWhatsApp = () => {
    const { beneficiario, financeiro, parcelas_pdf, parcelas_projetadas } = dados;
    const todasParcelas = [...(parcelas_pdf || []), ...(parcelas_projetadas || [])];
    const proximaParcela = todasParcelas[0];

    return `Olá ${beneficiario.nome.split(' ')[0]}! Seu benefício de Salário-Maternidade foi processado ✅

💰 Total do benefício: ${fmtBRL(financeiro.total_beneficio)}
🏢 Nossos honorários: ${fmtBRL(financeiro.honorarios_start)} (${fmtPct(financeiro.aliquota)})
👤 Você receberá: ${fmtBRL(financeiro.valor_cliente)}

📅 Próximo pagamento INSS: ${proximaParcela?.data_inss || 'A confirmar'}

Qualquer dúvida, estamos à disposição!`;
  };

  const handleCopiar = async () => {
    const texto = gerarTextoWhatsApp();
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = texto;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopiar}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
        copiado
          ? 'bg-st-success text-white'
          : 'bg-st-success/20 text-st-success hover:bg-st-success/30'
      }`}
    >
      {copiado ? '✅ Copiado!' : '📱 WhatsApp'}
    </button>
  );
};

// =============================================================================
// COMPONENTE PRINCIPAL: Relatório de Faturamento
// =============================================================================

export default function RelatorioFaturamento({ params }) {
  const [dados, setDados] = useState(DADOS_TESTE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    // Aqui você pode buscar dados reais da API usando params.dealId
    // const fetchDados = async () => {
    //   const res = await fetch(`/api/relatorio/${params.dealId}`);
    //   const data = await res.json();
    //   setDados(data);
    // };
    // fetchDados();
  }, [params?.dealId]);

  const { beneficiario, datas, financeiro, parcelas_pdf, parcelas_projetadas, explicacoes, observacoes, deal_id, status, versao, timestamp } = dados;

  const totalFaturas = (parcelas_pdf?.length || 0) + (parcelas_projetadas?.length || 0);

  return (
    <div className="min-h-screen bg-st-bg text-st-text">
      {/* Container principal */}
      <div className="max-w-6xl mx-auto p-4 md:p-8">

        {/* HEADER */}
        <header className={`mb-6 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-st-muted text-sm mb-2">
                <span>Recebimento</span>
                <span>/</span>
                <span>Relatórios</span>
                <span>/</span>
                <span className="text-st-text">Criação de Fatura</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-st-text">
                Relatório de Criação de Fatura
              </h1>
              <p className="text-st-muted text-sm mt-1">
                Deal #{deal_id} • {timestamp} • {versao}
              </p>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <a
                href={`https://startprev.bitrix24.com.br/crm/deal/details/${deal_id}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-st-navy text-white rounded-lg text-sm font-medium hover:bg-st-navy/80 transition-all flex items-center gap-2"
              >
                🔗 Bitrix
              </a>
              <BotaoWhatsApp dados={dados} />
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-st-surface border border-st-border text-st-text rounded-lg text-sm font-medium hover:bg-st-surface-hover transition-all flex items-center gap-2"
              >
                📄 PDF
              </button>
            </div>
          </div>
        </header>

        {/* BANNER DE STATUS */}
        <div className={`transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <BannerStatus
            status={status}
            regra={financeiro.regra}
            valorStart={financeiro.honorarios_start}
            qtdFaturas={totalFaturas}
            saldoRestante={financeiro.saldo_restante}
          />
        </div>

        {/* FLUXO FINANCEIRO */}
        <div className={`transition-all duration-500 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <FluxoFinanceiro
            totalBruto={financeiro.total_beneficio}
            aliquota={financeiro.aliquota}
            honorarios={financeiro.honorarios_start}
            saldoRestante={financeiro.saldo_restante}
            mrMensal={financeiro.mr}
          />
        </div>

        {/* GRID: IDENTIFICAÇÃO + VIGÊNCIA */}
        <div className={`grid md:grid-cols-2 gap-6 mb-6 transition-all duration-500 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <CardIdentificacao beneficiario={beneficiario} />
          <TimelineVigencia datas={datas} mr={financeiro.mr} especie={datas.especie} />
        </div>

        {/* FATURAS CONTIDAS NO PDF */}
        {parcelas_pdf && parcelas_pdf.length > 0 && (
          <div className={`mb-6 transition-all duration-500 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h3 className="text-sm font-semibold text-st-text mb-4 flex items-center gap-2">
              📋 Faturas Contidas no PDF
              <span className="text-xs bg-st-accent/20 text-st-accent px-2 py-0.5 rounded-full">
                {parcelas_pdf.length}
              </span>
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {parcelas_pdf.map((fatura, i) => (
                <TicketFatura key={i} fatura={fatura} isProjecao={false} />
              ))}
            </div>
          </div>
        )}

        {/* FATURAS PROJETADAS */}
        {parcelas_projetadas && parcelas_projetadas.length > 0 && (
          <div className={`mb-6 transition-all duration-500 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h3 className="text-sm font-semibold text-st-text mb-4 flex items-center gap-2">
              🔮 Faturas Projetadas
              <span className="text-xs bg-st-warning/20 text-st-warning px-2 py-0.5 rounded-full">
                {parcelas_projetadas.length}
              </span>
            </h3>
            <div className="bg-st-warning/5 border border-st-warning/20 rounded-lg p-3 mb-4">
              <p className="text-xs text-st-warning">
                ⚠️ Valores projetados são estimativas baseadas no calendário INSS. Os valores reais podem variar.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {parcelas_projetadas.map((fatura, i) => (
                <TicketFatura key={i} fatura={fatura} isProjecao={true} />
              ))}
            </div>
          </div>
        )}

        {/* EXPLICAÇÕES */}
        <div className={`transition-all duration-500 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <SecaoExplicacoes explicacoes={explicacoes} />
        </div>

        {/* OBSERVAÇÕES */}
        <div className={`transition-all duration-500 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <SecaoObservacoes observacoes={observacoes} />
        </div>

        {/* FOOTER */}
        <footer className={`mt-8 pt-6 border-t border-st-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-st-muted print:hidden transition-all duration-500 delay-800 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-4">
            <span>📅 {timestamp}</span>
            <span>🔧 Workflow {versao}</span>
            <span>👤 {beneficiario.responsavel}</span>
          </div>
          <div className="text-st-muted">
            Start Assessoria • OneStart
          </div>
        </footer>
      </div>

      {/* CSS para impressão */}
      <style jsx global>{`
        @media print {
          body, .min-h-screen {
            background: white !important;
            color: black !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .bg-st-surface, .bg-st-bg {
            background: #f5f5f5 !important;
          }
          .text-st-text {
            color: #1a1a1a !important;
          }
          .text-st-muted {
            color: #666 !important;
          }
          .text-st-accent {
            color: #d97706 !important;
          }
          .border-st-border {
            border-color: #ddd !important;
          }
        }
      `}</style>
    </div>
  );
}
