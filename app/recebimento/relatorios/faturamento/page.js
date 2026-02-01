'use client';

import { useState, useEffect } from 'react';

// Dados de exemplo (viriam do workflow n8n)
const dadosRelatorio = {
  deal_id: 119842,
  status: "SUCESSO",
  versao: "V25",
  timestamp: "31/01/2026 19:53:32",

  beneficiario: {
    nome: "ELENA COSTA TESTE CINCO",
    cpf: "111.222.333-05",
    nb: "240.005.005-5",
    nit: "123.45678.05-5",
    telefone: "(11) 90005-0005",
    responsavel: "Marcus Viniccius",
    banco: "Ag. Centro - São Paulo/SP",
    banco_id: "441"
  },

  datas: {
    dib: "01/08/2025",
    dcb: "28/11/2025",
    dip: "01/08/2025",
    duracao: 120,
    competencia_atual: "11/2025"
  },

  financeiro: {
    mr: 3000,
    total_beneficio: 10986,
    honorarios_start: 3295,
    valor_cliente: 7691.44,
    saldo_restante: 0,
    aliquota: 0.30,
    aliquota_inss: 8.44,
    tem_13o: true,
    valor_13o: 1000
  },

  faturas: [
    {
      parcela: 1,
      total_parcelas: 1,
      competencia: "11/2025",
      data_inss: "23/12/2025",
      valor_inss: 10986.44,
      valor_start: 3295,
      valor_cliente: 7691.44,
      aliquota: 0.30,
      regra: "QUITACAO",
      status: "CRIADA",
      invoice_id: 12345
    }
  ]
};

// Componente de Contador Animado
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

// Componente de Progresso Circular
const CircularProgress = ({ value, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (value / 100) * circumference);
    }, 300);
    return () => clearTimeout(timer);
  }, [value, circumference]);

  const color = value === 100 ? "#10b981" : "#f59e0b"; // verde se quitado, amarelo se pendente

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
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
        <span className="text-2xl font-bold text-azul-escuro">{value}%</span>
      </div>
    </div>
  );
};

// Faixas de Alíquota
const FAIXAS_ALIQUOTA = [
  { min: 0, max: 2000, aliquota: 30, label: "até R$ 2.000" },
  { min: 2000.01, max: 3000, aliquota: 30, label: "R$ 2.000 a R$ 3.000" },
  { min: 3000.01, max: 5000, aliquota: 35, label: "R$ 3.000 a R$ 5.000" },
  { min: 5000.01, max: 8000, aliquota: 40, label: "R$ 5.000 a R$ 8.000" },
  { min: 8000.01, max: Infinity, aliquota: 45, label: "acima de R$ 8.000" },
];

export default function CriacaoFatura() {
  const [expandedFatura, setExpandedFatura] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => { setIsLoaded(true); }, []);

  const dados = dadosRelatorio;
  const progresso = dados.financeiro.saldo_restante <= 0 ? 100 : Math.round(((dados.financeiro.honorarios_start - dados.financeiro.saldo_restante) / dados.financeiro.honorarios_start) * 100);
  const faixaAtual = FAIXAS_ALIQUOTA.find(f => dados.financeiro.mr >= f.min && dados.financeiro.mr <= f.max);

  const explicacoes = {
    aliquota: {
      titulo: `Por que ${(dados.financeiro.aliquota * 100).toFixed(0)}%?`,
      texto: `A MR de R$ ${dados.financeiro.mr.toLocaleString('pt-BR')} se enquadra na faixa "${faixaAtual?.label}", que corresponde a ${faixaAtual?.aliquota}% de honorários.`,
      icon: "📊",
      cor: "amarelo"
    },
    regra: {
      titulo: "Por que QUITAÇÃO?",
      texto: `O valor INSS (R$ ${dados.faturas[0]?.valor_inss.toLocaleString('pt-BR')}) é suficiente para cobrar todos os honorários mantendo a regra dos 50%.`,
      icon: "🎯",
      cor: "green"
    },
    parcelas: {
      titulo: `Por que ${dados.faturas.length} parcela(s)?`,
      texto: `O benefício foi pago em ${dados.faturas.length} competência(s) com valor suficiente para quitação.`,
      icon: "📋",
      cor: "blue"
    }
  };

  return (
    <div className="p-4 lg:p-8 animate-fadeIn">
      {/* Header */}
      <header className={`bg-white rounded-xl p-6 mb-6 border border-cinza-borda shadow-sm transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-cinza-medio mb-2">
              <span>Início</span>
              <span>/</span>
              <span>Recebimento</span>
              <span>/</span>
              <span>Relatórios</span>
              <span>/</span>
              <span className="text-azul-escuro font-medium">Criação de Fatura</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-azul-escuro flex items-center gap-3">
              <span className="w-12 h-12 bg-amarelo/10 rounded-xl flex items-center justify-center text-2xl">
                📋
              </span>
              Criação de Fatura
            </h1>
            <p className="text-cinza-medio mt-1">
              Deal #{dados.deal_id} • {dados.timestamp}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${
              dados.status === 'SUCESSO'
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {dados.status === 'SUCESSO' ? '✅' : '❌'} {dados.status}
            </span>
            <a
              href={`https://startprev.bitrix24.com.br/crm/deal/details/${dados.deal_id}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-azul-escuro hover:bg-azul-hover text-white rounded-lg text-sm font-medium transition-all hover:shadow-lg flex items-center gap-2"
            >
              🔗 Abrir no Bitrix
            </a>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {[
          { label: "Total Benefício", value: dados.financeiro.total_beneficio, icon: "💰", bg: "bg-blue-50", iconBg: "bg-blue-100", valueColor: "text-blue-600" },
          { label: "Honorários Start", value: dados.financeiro.honorarios_start, icon: "🏢", bg: "bg-amarelo/5", iconBg: "bg-amarelo/20", valueColor: "text-amarelo-hover" },
          { label: "Valor Cliente", value: dados.financeiro.valor_cliente, icon: "👤", bg: "bg-green-50", iconBg: "bg-green-100", valueColor: "text-green-600" },
          { label: "MR Mensal", value: dados.financeiro.mr, icon: "📊", bg: "bg-purple-50", iconBg: "bg-purple-100", valueColor: "text-purple-600" },
        ].map((stat, i) => (
          <div
            key={i}
            className={`${stat.bg} rounded-xl p-5 border border-cinza-borda hover:shadow-md transition-all hover:scale-[1.02]`}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-9 h-9 ${stat.iconBg} rounded-lg flex items-center justify-center text-lg`}>
                {stat.icon}
              </span>
              <span className="text-xs text-cinza-medio uppercase tracking-wider font-medium">{stat.label}</span>
            </div>
            <div className={`text-xl lg:text-2xl font-extrabold ${stat.valueColor}`}>
              <AnimatedCounter value={stat.value} prefix="R$ " />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Beneficiário */}
        <div className={`bg-white rounded-xl border border-cinza-borda shadow-sm transition-all duration-500 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="p-5 border-b border-cinza-borda">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-azul-escuro/10 flex items-center justify-center text-xl">👤</div>
              <div>
                <h2 className="font-bold text-azul-escuro">Beneficiário</h2>
                <p className="text-xs text-cinza-medio">Dados do cliente</p>
              </div>
            </div>
          </div>
          <div className="p-5">
            <div className="space-y-3">
              {[
                { label: "Nome", value: dados.beneficiario.nome, highlight: true },
                { label: "CPF", value: dados.beneficiario.cpf },
                { label: "NB", value: dados.beneficiario.nb },
                { label: "NIT", value: dados.beneficiario.nit },
                { label: "Telefone", value: dados.beneficiario.telefone },
                { label: "Responsável", value: dados.beneficiario.responsavel },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-cinza-borda/50 last:border-0">
                  <span className="text-xs text-cinza-medio uppercase tracking-wider">{item.label}</span>
                  <span className={`font-mono text-sm ${item.highlight ? 'text-azul-escuro font-semibold' : 'text-cinza-escuro'}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progresso Central */}
        <div className={`bg-white rounded-xl border border-cinza-borda shadow-sm flex flex-col items-center justify-center p-6 transition-all duration-500 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <h2 className="font-bold text-azul-escuro mb-5">Progresso da Cobrança</h2>
          <CircularProgress value={progresso} size={150} />
          <div className="mt-5 text-center">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              progresso === 100
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-amarelo/10 text-amarelo-hover border border-amarelo/30'
            }`}>
              {progresso === 100 ? '🎯 QUITADO' : `${progresso}% cobrado`}
            </span>
            <p className="text-cinza-medio text-sm mt-3">
              Saldo: <span className="font-semibold text-azul-escuro">R$ {dados.financeiro.saldo_restante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </p>
          </div>
        </div>

        {/* Datas */}
        <div className={`bg-white rounded-xl border border-cinza-borda shadow-sm transition-all duration-500 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="p-5 border-b border-cinza-borda">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amarelo/10 flex items-center justify-center text-xl">📅</div>
              <div>
                <h2 className="font-bold text-azul-escuro">Período do Benefício</h2>
                <p className="text-xs text-cinza-medio">{dados.datas.duracao} dias</p>
              </div>
            </div>
          </div>
          <div className="p-5 space-y-3">
            {[
              { label: "DIB (Início)", value: dados.datas.dib, icon: "🟢", bg: "bg-green-50" },
              { label: "DCB (Cessação)", value: dados.datas.dcb, icon: "🔴", bg: "bg-red-50" },
              { label: "DIP (Pagamento)", value: dados.datas.dip, icon: "💳", bg: "bg-blue-50" },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 ${item.bg} rounded-xl`}>
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-xs text-cinza-medio">{item.label}</p>
                  <p className="font-mono font-semibold text-azul-escuro">{item.value}</p>
                </div>
              </div>
            ))}

            {dados.financeiro.tem_13o && (
              <div className="flex items-center gap-3 p-3 bg-amarelo/10 border border-amarelo/30 rounded-xl">
                <span className="text-lg">🎄</span>
                <div className="flex-1">
                  <p className="text-xs text-amarelo-hover font-medium">Inclui 13º Salário</p>
                  <p className="font-mono font-bold text-amarelo-hover">
                    R$ {dados.financeiro.valor_13o.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Explicações das Decisões */}
      <div className={`bg-white rounded-xl border border-cinza-borda shadow-sm mb-6 transition-all duration-500 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="p-5 border-b border-cinza-borda">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center text-xl">💡</div>
            <div>
              <h2 className="font-bold text-azul-escuro">Explicação das Decisões</h2>
              <p className="text-xs text-cinza-medio">Por que o sistema decidiu assim</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {Object.entries(explicacoes).map(([key, exp]) => (
              <div
                key={key}
                className={`p-4 rounded-xl border transition-all hover:scale-[1.02] hover:shadow-md ${
                  exp.cor === 'green' ? 'bg-green-50 border-green-200' :
                  exp.cor === 'amarelo' ? 'bg-amarelo/5 border-amarelo/30' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{exp.icon}</span>
                  <h3 className={`font-semibold ${
                    exp.cor === 'green' ? 'text-green-700' :
                    exp.cor === 'amarelo' ? 'text-amarelo-hover' :
                    'text-blue-700'
                  }`}>
                    {exp.titulo}
                  </h3>
                </div>
                <p className="text-sm text-cinza-escuro leading-relaxed">{exp.texto}</p>
              </div>
            ))}
          </div>

          {/* Tabela de Faixas */}
          <div className="p-4 bg-cinza-bg rounded-xl">
            <h4 className="text-sm font-semibold text-azul-escuro mb-4 flex items-center gap-2">
              📊 Tabela de Alíquotas Start
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {FAIXAS_ALIQUOTA.map((faixa, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-center transition-all ${
                    faixa === faixaAtual
                      ? 'bg-amarelo/20 border-2 border-amarelo scale-105 shadow-md'
                      : 'bg-white border border-cinza-borda'
                  }`}
                >
                  <div className={`text-2xl font-extrabold ${faixa === faixaAtual ? 'text-amarelo-hover' : 'text-cinza-medio'}`}>
                    {faixa.aliquota}%
                  </div>
                  <div className="text-xs text-cinza-medio mt-1">{faixa.label}</div>
                  {faixa === faixaAtual && (
                    <div className="text-xs text-amarelo-hover mt-1 font-bold">← ATUAL</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Faturas */}
      <div className={`bg-white rounded-xl border border-cinza-borda shadow-sm mb-6 transition-all duration-500 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="p-5 border-b border-cinza-borda">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center text-xl">💳</div>
            <div>
              <h2 className="font-bold text-azul-escuro">Faturas Criadas</h2>
              <p className="text-xs text-cinza-medio">{dados.faturas.length} fatura(s) no total</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {dados.faturas.map((fatura, i) => (
            <div
              key={i}
              className={`rounded-xl border overflow-hidden transition-all ${
                expandedFatura === i
                  ? 'border-green-300 bg-green-50/50 shadow-md'
                  : 'border-cinza-borda hover:border-cinza-medio hover:shadow-sm'
              }`}
            >
              {/* Header da Fatura */}
              <div
                className="p-4 cursor-pointer flex items-center justify-between bg-white"
                onClick={() => setExpandedFatura(expandedFatura === i ? -1 : i)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex flex-col items-center justify-center text-white shadow-md">
                    <span className="text-xl font-bold leading-none">{fatura.parcela}</span>
                    <span className="text-[10px] opacity-80">de {fatura.total_parcelas}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-azul-escuro">Parcela {fatura.parcela}/{fatura.total_parcelas}</h3>
                    <p className="text-sm text-cinza-medio">
                      Competência: {fatura.competencia} • INSS: {fatura.data_inss}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex gap-2">
                    {fatura.regra === 'QUITACAO' && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                        🎯 QUITAÇÃO
                      </span>
                    )}
                    {fatura.valor_inss > 5000 && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amarelo/10 text-amarelo-hover border border-amarelo/30">
                        ⭐ ALTO VALOR
                      </span>
                    )}
                  </div>
                  <span className={`text-cinza-medio transition-transform duration-300 ${expandedFatura === i ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </div>
              </div>

              {/* Conteúdo Expandido */}
              <div className={`overflow-hidden transition-all duration-300 ${expandedFatura === i ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-5 pt-0 border-t border-cinza-borda bg-white">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 mt-4">
                    {[
                      { label: "Valor INSS", value: fatura.valor_inss, color: "text-blue-600", bg: "bg-blue-50" },
                      { label: "Valor Start", value: fatura.valor_start, color: "text-amarelo-hover", bg: "bg-amarelo/5" },
                      { label: "Valor Cliente", value: fatura.valor_cliente, color: "text-green-600", bg: "bg-green-50" },
                      { label: "Alíquota", value: `${(fatura.aliquota * 100).toFixed(0)}%`, isPercent: true, color: "text-purple-600", bg: "bg-purple-50" },
                    ].map((item, j) => (
                      <div key={j} className={`p-3 ${item.bg} rounded-xl text-center`}>
                        <div className="text-xs text-cinza-medio uppercase mb-1">{item.label}</div>
                        <div className={`font-mono font-bold text-lg ${item.color}`}>
                          {item.isPercent ? item.value : `R$ ${item.value.toLocaleString('pt-BR')}`}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Memória de Cálculo */}
                  <div className="p-4 bg-azul-escuro/5 border border-azul-escuro/10 rounded-xl mb-4">
                    <div className="flex items-center gap-2 text-azul-escuro font-semibold mb-2">
                      <span>🧮</span> Memória de Cálculo
                    </div>
                    <div className="font-mono text-sm text-cinza-escuro">
                      R$ {fatura.valor_inss.toLocaleString('pt-BR')} × {(fatura.aliquota * 100).toFixed(0)}% = R$ {(fatura.valor_inss * fatura.aliquota).toLocaleString('pt-BR')} → Truncado para R$ {fatura.valor_start.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-xs text-cinza-medio mt-2 flex items-center gap-1">
                      <span className="text-green-600">✓</span>
                      Cliente retém: R$ {fatura.valor_cliente.toLocaleString('pt-BR')} ({((fatura.valor_cliente / fatura.valor_inss) * 100).toFixed(1)}%) — Regra 50% respeitada
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-3">
                    <a
                      href={`https://startprev.bitrix24.com.br/crm/type/31/details/${fatura.invoice_id}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 bg-azul-escuro hover:bg-azul-hover text-white rounded-xl text-sm font-semibold text-center transition-all hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      🔗 Ver Fatura no Bitrix
                    </a>
                    <button className="px-5 py-3 bg-cinza-bg hover:bg-cinza-borda text-azul-escuro rounded-xl text-sm font-medium transition-all flex items-center gap-2">
                      📋 Copiar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className={`bg-azul-escuro rounded-xl p-5 flex flex-col md:flex-row justify-between items-center gap-4 transition-all duration-500 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex items-center gap-4 text-white/80 text-sm">
          <span className="flex items-center gap-2">📅 {dados.timestamp}</span>
          <span className="hidden md:inline">•</span>
          <span className="flex items-center gap-2">🔧 Workflow {dados.versao}</span>
          <span className="hidden md:inline">•</span>
          <span className="flex items-center gap-2">👤 {dados.beneficiario.responsavel}</span>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2">
            📄 Exportar PDF
          </button>
          <button className="px-4 py-2 bg-amarelo hover:bg-amarelo-hover text-azul-escuro rounded-lg text-sm font-semibold transition-all flex items-center gap-2">
            🔄 Reprocessar
          </button>
        </div>
      </footer>
    </div>
  );
}
