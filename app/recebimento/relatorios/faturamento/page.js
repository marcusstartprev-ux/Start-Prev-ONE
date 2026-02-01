'use client';

import { useState } from 'react';

// Dados de exemplo (serão substituídos pelos dados reais do n8n)
const dadosExemplo = {
  resumo: {
    nome: "ELENA COSTA TESTE CINCO",
    cpf: "11122233305",
    cpf_formatado: "111.222.333-05",
    cpf_match: true,
    nb: "240.005.005-5",
    nb_formatado: "240.005.005-5",
    nb_match: true,
    mr: 3000,
    mr_formatado: "R$ 3.000,00",
    dib: "2025-08-01T03:00:00+00:00",
    dcb: "2025-11-28T03:00:00+00:00",
    deal_id: 119842,
    aliquota_inss: 8.44,
    aliquota_inss_formatada: "8.44%",
    total_120_dias: 10986,
    total_120_dias_formatado: "R$ 10.986,00",
    aliquota_honorarios: 0.3,
    aliquota_honorarios_formatada: "30.00%",
    honorarios_start: 3295,
    honorarios_start_formatado: "R$ 3.295,00",
    total_parcelas: 1,
    parcela_quitacao: 1,
    total_start: 3295,
    total_start_formatado: "R$ 3.295,00",
    total_cliente: 7691.44,
    total_cliente_formatado: "R$ 7.691,44",
    saldo_start_final: 0,
    saldo_start_final_formatado: "R$ 0,00",
    dias_totais: 120,
    tem_13o: true,
    valor_13o: 1000,
    valor_13o_formatado: "R$ 1.000,00",
    darf: {
      start_paga_darf: false,
      valor_darf_total: 0,
    }
  },
  debug: {
    parcela: 1,
    total_parcelas: 1,
    competencia: "11/2025",
    valor_inss: 10986.44,
    valor_start: 3295,
    valor_cliente: 7691.44,
    aliquota_start: 0.29,
    regra: "QUITACAO",
    saldo_depois: 0,
    campos_criticos: {
      cpf: { valor: "11122233305", fonte: "campos_invoice/fallback" },
      nit: { valor: "12345678055", fonte: "campos_invoice/fallback" },
      nb: { valor: "240.005.005-5", fonte: "campos_invoice/fallback" },
      ultimo_relacionador: { valor: "Marcus Viniccius", fonte: "campos_invoice" }
    }
  },
  auditoria: {
    total_problemas: 0,
    total_alertas: 0,
    problemas: [],
    alertas: [],
    validacoes: {
      cpf_ok: true,
      nb_ok: true,
      mr_ok: true,
      datas_ok: true,
      parcelas_ok: true,
      honorarios_ok: true,
      soma_ok: true,
      faixas_ok: true,
      quitacao_ok: true,
      regra_50_ok: true,
      duplicidade_ok: true,
      pdf_vs_deal_cpf_ok: true,
      pdf_vs_deal_nb_ok: true,
      darf_ok: true
    },
    campos_criticos: {
      total: 7,
      preenchidos: 7,
      vazios: 0,
      lista_preenchidos: ["nit", "dib", "dcb", "dip", "competencia", "data_atualizacao_extrato", "endereco_banco"]
    }
  },
  tags: [
    "TAG_CPF_OK", "TAG_NIT_OK", "TAG_NOME_OK", "TAG_NB_OK", "TAG_MR_OK",
    "TAG_DIB_OK", "TAG_DCB_OK", "TAG_DIP_OK", "OK_QUITACAO", "OK_CALCULO_COMPLETO",
    "OK_HONORARIOS_30_PERCENT", "OK_SOMA_BATE", "INFO_TEM_13O"
  ],
  status: "CRIAR_FATURA",
  anti_dup: {
    deal_id: 119842,
    parcela: 1,
    competencia: "11/2025",
    titulo: "SM ELENA COSTA TESTE CINCO - Parcela 1/1 - 11/2025"
  },
  body: {
    fields: {
      title: "SM ELENA COSTA TESTE CINCO - Parcela 1/1 - 11/2025",
      parentId2: 119842
    }
  }
};

// Função para formatar data
function formatarData(dataISO) {
  if (!dataISO) return '-';
  try {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR');
  } catch {
    return dataISO;
  }
}

// Função para classificar tags
function classificarTag(tag) {
  if (tag.startsWith('OK_') || tag.startsWith('TAG_') && tag.includes('_OK')) {
    return 'success';
  }
  if (tag.startsWith('ERRO_') || tag.startsWith('E_')) {
    return 'error';
  }
  if (tag.startsWith('ALERTA_') || tag.startsWith('A_') || tag.includes('AUSENTE')) {
    return 'warning';
  }
  if (tag.startsWith('INFO_')) {
    return 'info';
  }
  return 'neutral';
}

// Componente de Tag
function TagBadge({ tag }) {
  const tipo = classificarTag(tag);
  const cores = {
    success: 'bg-green-100 text-green-700 border-green-200',
    error: 'bg-red-100 text-red-700 border-red-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    neutral: 'bg-cinza-bg text-cinza-medio border-cinza-borda'
  };
  const icones = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
    neutral: '•'
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${cores[tipo]}`}>
      <span>{icones[tipo]}</span>
      {tag.replace(/^(OK_|TAG_|ERRO_|ALERTA_|INFO_|E_|A_)/, '')}
    </span>
  );
}

// Componente de Card de Validação
function ValidacaoItem({ nome, status }) {
  return (
    <div className={`flex items-center justify-between p-2 rounded-lg ${status ? 'bg-green-50' : 'bg-red-50'}`}>
      <span className="text-xs text-cinza-escuro">{nome}</span>
      <span className={`text-sm ${status ? 'text-green-600' : 'text-red-600'}`}>
        {status ? '✓' : '✕'}
      </span>
    </div>
  );
}

// Componente Principal
export default function RelatorioFaturamento() {
  const [dados] = useState(dadosExemplo);
  const [abaAtiva, setAbaAtiva] = useState('resumo');
  const [mostrarTags, setMostrarTags] = useState(false);

  const { resumo, debug, auditoria, tags, status, anti_dup, body } = dados;

  // Calcular progresso da cobrança
  const progressoCobranca = resumo.total_start > 0
    ? ((resumo.total_start - resumo.saldo_start_final) / resumo.total_start) * 100
    : 100;

  // Status geral
  const statusGeral = auditoria.total_problemas === 0 ? 'sucesso' : auditoria.total_alertas > 0 ? 'alerta' : 'erro';
  const statusConfig = {
    sucesso: { bg: 'bg-green-500', text: 'Processado com Sucesso', icon: '✓' },
    alerta: { bg: 'bg-yellow-500', text: 'Processado com Alertas', icon: '⚠' },
    erro: { bg: 'bg-red-500', text: 'Erro no Processamento', icon: '✕' }
  };

  return (
    <div className="p-4 lg:p-8 animate-fadeIn">
      {/* Header Principal */}
      <header className="bg-gradient-to-r from-azul-escuro to-azul-sidebar rounded-xl p-6 mb-6 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
              <span>Início</span>
              <span>/</span>
              <span>Recebimento</span>
              <span>/</span>
              <span>Relatórios</span>
              <span>/</span>
              <span className="text-white font-medium">Faturamento</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold flex items-center gap-3">
              <span className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl">
                📋
              </span>
              Relatório de Faturamento
            </h1>
            <p className="text-white/80 mt-2">
              {body?.fields?.title || `Fatura ${debug.parcela}/${debug.total_parcelas}`}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className={`${statusConfig[statusGeral].bg} px-4 py-2 rounded-full flex items-center gap-2 font-semibold shadow-md`}>
              <span className="text-lg">{statusConfig[statusGeral].icon}</span>
              {statusConfig[statusGeral].text}
            </div>
            <a
              href={`https://startprev.bitrix24.com.br/crm/deal/details/${resumo.deal_id}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2"
            >
              <span>🔗</span>
              Deal #{resumo.deal_id}
            </a>
          </div>
        </div>
      </header>

      {/* Cards de Resumo Rápido */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-cinza-borda shadow-sm">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl mb-3">💰</div>
          <div className="text-2xl font-extrabold text-azul-escuro">{resumo.total_120_dias_formatado}</div>
          <div className="text-sm text-cinza-medio">Total Benefício INSS</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-cinza-borda shadow-sm">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl mb-3">🏢</div>
          <div className="text-2xl font-extrabold text-green-600">{resumo.total_start_formatado}</div>
          <div className="text-sm text-cinza-medio">Honorários Start</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-cinza-borda shadow-sm">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-xl mb-3">👤</div>
          <div className="text-2xl font-extrabold text-purple-600">{resumo.total_cliente_formatado}</div>
          <div className="text-sm text-cinza-medio">Valor Cliente</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-cinza-borda shadow-sm">
          <div className="w-10 h-10 bg-amarelo/20 rounded-lg flex items-center justify-center text-xl mb-3">📊</div>
          <div className="text-2xl font-extrabold text-amarelo">{resumo.aliquota_honorarios_formatada}</div>
          <div className="text-sm text-cinza-medio">Alíquota Aplicada</div>
        </div>
      </div>

      {/* Navegação por Abas */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'resumo', label: '👤 Beneficiário', icon: '👤' },
          { id: 'valores', label: '💰 Valores', icon: '💰' },
          { id: 'faturas', label: '📋 Faturas', icon: '📋' },
          { id: 'decisoes', label: '🧠 Decisões', icon: '🧠' },
          { id: 'auditoria', label: '🔍 Auditoria', icon: '🔍' }
        ].map(aba => (
          <button
            key={aba.id}
            onClick={() => setAbaAtiva(aba.id)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
              abaAtiva === aba.id
                ? 'bg-azul-escuro text-white shadow-md'
                : 'bg-white text-cinza-escuro hover:bg-cinza-bg border border-cinza-borda'
            }`}
          >
            {aba.label}
          </button>
        ))}
      </div>

      {/* Conteúdo das Abas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">

          {/* Aba: Beneficiário */}
          {abaAtiva === 'resumo' && (
            <div className="bg-white rounded-xl border border-cinza-borda shadow-sm animate-fadeIn">
              <div className="p-5 border-b border-cinza-borda">
                <h2 className="font-bold text-azul-escuro flex items-center gap-2">
                  <span className="text-xl">👤</span>
                  Dados do Beneficiário
                </h2>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2 bg-azul-escuro/5 rounded-lg p-4">
                    <span className="text-xs text-cinza-medio uppercase">Nome Completo</span>
                    <div className="text-lg font-bold text-azul-escuro mt-1">{resumo.nome}</div>
                  </div>

                  <div className="bg-cinza-bg rounded-lg p-4">
                    <span className="text-xs text-cinza-medio uppercase">CPF</span>
                    <div className="font-semibold text-azul-escuro mt-1 flex items-center gap-2">
                      {resumo.cpf_formatado}
                      {resumo.cpf_match && <span className="text-green-500 text-sm">✓</span>}
                    </div>
                  </div>

                  <div className="bg-cinza-bg rounded-lg p-4">
                    <span className="text-xs text-cinza-medio uppercase">NB (Número do Benefício)</span>
                    <div className="font-semibold text-azul-escuro mt-1 flex items-center gap-2">
                      {resumo.nb_formatado}
                      {resumo.nb_match && <span className="text-green-500 text-sm">✓</span>}
                    </div>
                  </div>

                  <div className="bg-cinza-bg rounded-lg p-4">
                    <span className="text-xs text-cinza-medio uppercase">NIT</span>
                    <div className="font-semibold text-azul-escuro mt-1">
                      {debug.campos_criticos?.nit?.valor || '-'}
                    </div>
                  </div>

                  <div className="bg-cinza-bg rounded-lg p-4">
                    <span className="text-xs text-cinza-medio uppercase">MR (Média de Remuneração)</span>
                    <div className="font-semibold text-green-600 mt-1">{resumo.mr_formatado}</div>
                  </div>
                </div>

                {/* Datas */}
                <div className="mt-6">
                  <h3 className="font-semibold text-azul-escuro mb-3 flex items-center gap-2">
                    <span>📅</span> Datas do Benefício
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <span className="text-xs text-blue-600 uppercase font-medium">DIB</span>
                      <div className="font-bold text-azul-escuro mt-1">{formatarData(resumo.dib)}</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 text-center">
                      <span className="text-xs text-red-600 uppercase font-medium">DCB</span>
                      <div className="font-bold text-azul-escuro mt-1">{formatarData(resumo.dcb)}</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <span className="text-xs text-purple-600 uppercase font-medium">Dias Totais</span>
                      <div className="font-bold text-azul-escuro mt-1">{resumo.dias_totais}</div>
                    </div>
                    <div className="bg-amarelo/10 rounded-lg p-3 text-center">
                      <span className="text-xs text-amarelo uppercase font-medium">Competência</span>
                      <div className="font-bold text-azul-escuro mt-1">{debug.competencia}</div>
                    </div>
                  </div>
                </div>

                {/* Info 13º */}
                {resumo.tem_13o && (
                  <div className="mt-4 bg-gradient-to-r from-amarelo/10 to-amarelo/5 rounded-lg p-4 border border-amarelo/20">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎄</span>
                      <div>
                        <span className="text-sm font-semibold text-azul-escuro">Inclui 13º Salário</span>
                        <div className="text-lg font-bold text-amarelo">{resumo.valor_13o_formatado}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Aba: Valores */}
          {abaAtiva === 'valores' && (
            <div className="bg-white rounded-xl border border-cinza-borda shadow-sm animate-fadeIn">
              <div className="p-5 border-b border-cinza-borda">
                <h2 className="font-bold text-azul-escuro flex items-center gap-2">
                  <span className="text-xl">💰</span>
                  Resumo Financeiro
                </h2>
              </div>
              <div className="p-5">
                {/* Barra de Progresso */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-cinza-medio">Progresso da Cobrança</span>
                    <span className="font-bold text-azul-escuro">{progressoCobranca.toFixed(0)}%</span>
                  </div>
                  <div className="h-4 bg-cinza-bg rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-azul-escuro to-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${progressoCobranca}%` }}
                    />
                  </div>
                </div>

                {/* Grid de Valores */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-xl p-5 text-center border border-blue-100">
                    <span className="text-3xl">🏦</span>
                    <div className="text-xs text-blue-600 uppercase font-medium mt-2">Total INSS</div>
                    <div className="text-2xl font-extrabold text-blue-700 mt-1">
                      {resumo.total_120_dias_formatado}
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-xl p-5 text-center border border-green-100">
                    <span className="text-3xl">🏢</span>
                    <div className="text-xs text-green-600 uppercase font-medium mt-2">Honorários Start</div>
                    <div className="text-2xl font-extrabold text-green-700 mt-1">
                      {resumo.total_start_formatado}
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      ({resumo.aliquota_honorarios_formatada})
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-5 text-center border border-purple-100">
                    <span className="text-3xl">👤</span>
                    <div className="text-xs text-purple-600 uppercase font-medium mt-2">Valor Cliente</div>
                    <div className="text-2xl font-extrabold text-purple-700 mt-1">
                      {resumo.total_cliente_formatado}
                    </div>
                  </div>
                </div>

                {/* Detalhamento */}
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between items-center p-3 bg-cinza-bg rounded-lg">
                    <span className="text-cinza-medio">Alíquota INSS</span>
                    <span className="font-semibold text-azul-escuro">{resumo.aliquota_inss_formatada}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-cinza-bg rounded-lg">
                    <span className="text-cinza-medio">Saldo Restante</span>
                    <span className={`font-semibold ${resumo.saldo_start_final === 0 ? 'text-green-600' : 'text-amarelo'}`}>
                      {resumo.saldo_start_final_formatado}
                    </span>
                  </div>
                  {resumo.darf?.start_paga_darf && (
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                      <span className="text-red-600">DARF (Start paga)</span>
                      <span className="font-semibold text-red-700">
                        R$ {resumo.darf.valor_darf_total?.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Fórmula */}
                <div className="mt-6 bg-azul-escuro/5 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-azul-escuro mb-2">📐 Cálculo Aplicado</h4>
                  <div className="font-mono text-sm text-cinza-escuro bg-white p-3 rounded-lg">
                    {resumo.total_120_dias_formatado} × {resumo.aliquota_honorarios_formatada} = {resumo.total_start_formatado}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Aba: Faturas */}
          {abaAtiva === 'faturas' && (
            <div className="bg-white rounded-xl border border-cinza-borda shadow-sm animate-fadeIn">
              <div className="p-5 border-b border-cinza-borda">
                <h2 className="font-bold text-azul-escuro flex items-center gap-2">
                  <span className="text-xl">📋</span>
                  Faturas Criadas
                  <span className="ml-auto bg-azul-escuro text-white text-xs px-2 py-1 rounded-full">
                    {debug.parcela}/{debug.total_parcelas}
                  </span>
                </h2>
              </div>
              <div className="p-5">
                {/* Timeline de Faturas */}
                <div className="relative">
                  {/* Linha da Timeline */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-cinza-borda" />

                  {/* Card da Fatura */}
                  <div className="relative pl-14 pb-6">
                    {/* Indicador */}
                    <div className="absolute left-4 w-5 h-5 bg-green-500 rounded-full border-4 border-white shadow-md flex items-center justify-center">
                      <span className="text-white text-[10px]">✓</span>
                    </div>

                    <div className="bg-gradient-to-br from-white to-green-50 rounded-xl border border-green-200 p-5 shadow-sm">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                        <div>
                          <span className="text-xs text-green-600 uppercase font-semibold">Parcela {debug.parcela} de {debug.total_parcelas}</span>
                          <h3 className="text-lg font-bold text-azul-escuro">
                            Competência {debug.competencia}
                          </h3>
                        </div>
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          ✓ {debug.regra === 'QUITACAO' ? 'QUITAÇÃO' : status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <span className="text-xs text-cinza-medio">Valor INSS</span>
                          <div className="font-bold text-blue-600">R$ {debug.valor_inss?.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                        </div>
                        <div>
                          <span className="text-xs text-cinza-medio">Valor Start</span>
                          <div className="font-bold text-green-600">R$ {debug.valor_start?.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                        </div>
                        <div>
                          <span className="text-xs text-cinza-medio">Valor Cliente</span>
                          <div className="font-bold text-purple-600">R$ {debug.valor_cliente?.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <span className="bg-amarelo/10 text-amarelo px-2 py-1 rounded text-xs font-semibold">
                          Alíquota: {(debug.aliquota_start * 100).toFixed(0)}%
                        </span>
                        <span className="bg-azul-escuro/10 text-azul-escuro px-2 py-1 rounded text-xs font-semibold">
                          Regra: {debug.regra}
                        </span>
                      </div>

                      {/* Box de Explicação */}
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                        <div className="flex items-start gap-2">
                          <span className="text-blue-500 text-lg">💡</span>
                          <div>
                            <span className="text-sm font-semibold text-blue-700">Por que {(debug.aliquota_start * 100).toFixed(0)}%?</span>
                            <p className="text-xs text-blue-600 mt-1">
                              {debug.aliquota_start === 0.30 && "Valor do benefício está na faixa até R$ 10.000 - aplica-se alíquota de 30%"}
                              {debug.aliquota_start === 0.25 && "Valor do benefício está na faixa de R$ 10.001 a R$ 20.000 - aplica-se alíquota de 25%"}
                              {debug.aliquota_start === 0.20 && "Valor do benefício está na faixa acima de R$ 20.000 - aplica-se alíquota de 20%"}
                              {debug.aliquota_start === 0.29 && "Alíquota padrão de 29% aplicada conforme contrato"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Link para Bitrix */}
                      <a
                        href={`https://startprev.bitrix24.com.br/crm/deal/details/${resumo.deal_id}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 w-full bg-azul-escuro hover:bg-azul-hover text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all font-semibold"
                      >
                        <span>🔗</span>
                        Abrir Fatura no Bitrix
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Aba: Decisões */}
          {abaAtiva === 'decisoes' && (
            <div className="bg-white rounded-xl border border-cinza-borda shadow-sm animate-fadeIn">
              <div className="p-5 border-b border-cinza-borda">
                <h2 className="font-bold text-azul-escuro flex items-center gap-2">
                  <span className="text-xl">🧠</span>
                  Explicação das Decisões
                </h2>
              </div>
              <div className="p-5 space-y-4">
                {/* Decisão: Alíquota */}
                <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl p-5 border border-blue-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
                      %
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-azul-escuro">Por que alíquota de {resumo.aliquota_honorarios_formatada}?</h3>
                      <p className="text-sm text-cinza-medio mt-2">
                        O valor total do benefício INSS é de <strong>{resumo.total_120_dias_formatado}</strong>.
                        Conforme a tabela de faixas de honorários:
                      </p>
                      <ul className="mt-2 text-sm text-cinza-escuro space-y-1">
                        <li className={`p-2 rounded ${resumo.aliquota_honorarios === 0.30 ? 'bg-amarelo/10 font-semibold' : ''}`}>
                          • Até R$ 10.000 → 30%
                        </li>
                        <li className={`p-2 rounded ${resumo.aliquota_honorarios === 0.25 ? 'bg-amarelo/10 font-semibold' : ''}`}>
                          • R$ 10.001 a R$ 20.000 → 25%
                        </li>
                        <li className={`p-2 rounded ${resumo.aliquota_honorarios === 0.20 ? 'bg-amarelo/10 font-semibold' : ''}`}>
                          • Acima de R$ 20.000 → 20%
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Decisão: Parcelas */}
                <div className="bg-gradient-to-r from-green-50 to-white rounded-xl p-5 border border-green-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl">
                      #
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-azul-escuro">Por que {debug.total_parcelas} parcela(s)?</h3>
                      <p className="text-sm text-cinza-medio mt-2">
                        A regra aplicada foi <strong>{debug.regra}</strong>.
                        {debug.regra === 'QUITACAO' && (
                          <span> Isso significa que todo o valor dos honorários é cobrado em uma única fatura,
                          pois o valor do INSS permite quitação total.</span>
                        )}
                        {debug.regra === 'PARCELA' && (
                          <span> O valor foi dividido em parcelas seguindo a regra dos 50% -
                          cada parcela não pode exceder 50% do valor do INSS daquele mês.</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Decisão: Regra 50% */}
                <div className="bg-gradient-to-r from-purple-50 to-white rounded-xl p-5 border border-purple-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl">
                      ½
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-azul-escuro">Regra dos 50% foi respeitada?</h3>
                      <p className="text-sm text-cinza-medio mt-2">
                        {auditoria.validacoes.regra_50_ok ? (
                          <span className="text-green-600 font-semibold">
                            ✓ Sim! O valor cobrado ({resumo.total_start_formatado}) representa {((resumo.total_start / resumo.total_120_dias) * 100).toFixed(1)}% do valor total do INSS.
                          </span>
                        ) : (
                          <span className="text-red-600 font-semibold">
                            ✕ Atenção! A regra dos 50% precisa ser verificada.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* DARF */}
                {resumo.darf && (
                  <div className="bg-gradient-to-r from-red-50 to-white rounded-xl p-5 border border-red-100">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white text-xl">
                        📄
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-azul-escuro">DARF</h3>
                        <p className="text-sm text-cinza-medio mt-2">
                          {resumo.darf.start_paga_darf ? (
                            <span className="text-red-600">
                              A Start paga o DARF neste caso. Valor: R$ {resumo.darf.valor_darf_total?.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-green-600 font-semibold">
                              ✓ DARF não se aplica neste caso
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Aba: Auditoria */}
          {abaAtiva === 'auditoria' && (
            <div className="bg-white rounded-xl border border-cinza-borda shadow-sm animate-fadeIn">
              <div className="p-5 border-b border-cinza-borda">
                <h2 className="font-bold text-azul-escuro flex items-center gap-2">
                  <span className="text-xl">🔍</span>
                  Auditoria e Validações
                </h2>
              </div>
              <div className="p-5">
                {/* Status Geral */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className={`rounded-xl p-4 text-center ${auditoria.total_problemas === 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <span className="text-3xl">{auditoria.total_problemas === 0 ? '✅' : '❌'}</span>
                    <div className="text-2xl font-bold mt-2">{auditoria.total_problemas}</div>
                    <div className="text-sm text-cinza-medio">Problemas</div>
                  </div>
                  <div className={`rounded-xl p-4 text-center ${auditoria.total_alertas === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <span className="text-3xl">{auditoria.total_alertas === 0 ? '✅' : '⚠️'}</span>
                    <div className="text-2xl font-bold mt-2">{auditoria.total_alertas}</div>
                    <div className="text-sm text-cinza-medio">Alertas</div>
                  </div>
                </div>

                {/* Validações */}
                <h3 className="font-semibold text-azul-escuro mb-3">Validações Realizadas</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
                  <ValidacaoItem nome="CPF" status={auditoria.validacoes.cpf_ok} />
                  <ValidacaoItem nome="NB" status={auditoria.validacoes.nb_ok} />
                  <ValidacaoItem nome="MR" status={auditoria.validacoes.mr_ok} />
                  <ValidacaoItem nome="Datas" status={auditoria.validacoes.datas_ok} />
                  <ValidacaoItem nome="Parcelas" status={auditoria.validacoes.parcelas_ok} />
                  <ValidacaoItem nome="Honorários" status={auditoria.validacoes.honorarios_ok} />
                  <ValidacaoItem nome="Soma" status={auditoria.validacoes.soma_ok} />
                  <ValidacaoItem nome="Faixas" status={auditoria.validacoes.faixas_ok} />
                  <ValidacaoItem nome="Quitação" status={auditoria.validacoes.quitacao_ok} />
                  <ValidacaoItem nome="Regra 50%" status={auditoria.validacoes.regra_50_ok} />
                  <ValidacaoItem nome="Duplicidade" status={auditoria.validacoes.duplicidade_ok} />
                  <ValidacaoItem nome="DARF" status={auditoria.validacoes.darf_ok} />
                </div>

                {/* Campos Críticos */}
                <div className="bg-cinza-bg rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-azul-escuro mb-3 flex items-center justify-between">
                    Campos Críticos
                    <span className={`text-sm px-2 py-1 rounded-full ${auditoria.campos_criticos.vazios === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {auditoria.campos_criticos.preenchidos}/{auditoria.campos_criticos.total} preenchidos
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {auditoria.campos_criticos.lista_preenchidos.map(campo => (
                      <span key={campo} className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                        ✓ {campo}
                      </span>
                    ))}
                    {auditoria.campos_criticos.lista_vazios?.map(campo => (
                      <span key={campo} className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">
                        ✕ {campo}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <button
                    onClick={() => setMostrarTags(!mostrarTags)}
                    className="w-full flex items-center justify-between p-3 bg-cinza-bg rounded-lg hover:bg-cinza-borda transition-all"
                  >
                    <span className="font-semibold text-azul-escuro flex items-center gap-2">
                      🏷️ Tags Geradas ({tags.length})
                    </span>
                    <span className="text-cinza-medio">{mostrarTags ? '▲' : '▼'}</span>
                  </button>

                  {mostrarTags && (
                    <div className="mt-3 p-4 bg-white rounded-lg border border-cinza-borda">
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag, i) => (
                          <TagBadge key={i} tag={tag} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Coluna Lateral */}
        <div className="space-y-6">
          {/* Card: Ações Rápidas */}
          <div className="bg-white rounded-xl border border-cinza-borda shadow-sm">
            <div className="p-5 border-b border-cinza-borda">
              <h2 className="font-bold text-azul-escuro flex items-center gap-2">
                <span>⚡</span>
                Ações Rápidas
              </h2>
            </div>
            <div className="p-5 space-y-3">
              <a
                href={`https://startprev.bitrix24.com.br/crm/deal/details/${resumo.deal_id}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-azul-escuro text-white rounded-lg hover:bg-azul-hover transition-all"
              >
                <span className="text-xl">🔗</span>
                <div>
                  <div className="font-semibold">Abrir Deal</div>
                  <div className="text-xs opacity-80">#{resumo.deal_id}</div>
                </div>
              </a>

              <a
                href={`https://startprev.bitrix24.com.br/crm/type/31/details/0/?parentId2=${resumo.deal_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-cinza-bg rounded-lg hover:bg-cinza-borda transition-all"
              >
                <span className="text-xl">📋</span>
                <div>
                  <div className="font-semibold text-azul-escuro">Ver Faturas</div>
                  <div className="text-xs text-cinza-medio">Todas do deal</div>
                </div>
              </a>

              <button className="w-full flex items-center gap-3 p-3 bg-cinza-bg rounded-lg hover:bg-cinza-borda transition-all">
                <span className="text-xl">📤</span>
                <div className="text-left">
                  <div className="font-semibold text-azul-escuro">Exportar PDF</div>
                  <div className="text-xs text-cinza-medio">Baixar relatório</div>
                </div>
              </button>
            </div>
          </div>

          {/* Card: Resumo do Deal */}
          <div className="bg-white rounded-xl border border-cinza-borda shadow-sm">
            <div className="p-5 border-b border-cinza-borda">
              <h2 className="font-bold text-azul-escuro flex items-center gap-2">
                <span>📊</span>
                Resumo do Deal
              </h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-cinza-medio text-sm">Deal ID</span>
                <span className="font-mono font-bold text-azul-escuro">#{resumo.deal_id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cinza-medio text-sm">Parcela</span>
                <span className="font-bold text-azul-escuro">{debug.parcela}/{debug.total_parcelas}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cinza-medio text-sm">Competência</span>
                <span className="font-bold text-azul-escuro">{debug.competencia}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cinza-medio text-sm">Regra</span>
                <span className="bg-amarelo/10 text-amarelo px-2 py-1 rounded text-xs font-bold">
                  {debug.regra}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cinza-medio text-sm">Status</span>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                  {status}
                </span>
              </div>
            </div>
          </div>

          {/* Card: Responsável */}
          <div className="bg-white rounded-xl border border-cinza-borda shadow-sm">
            <div className="p-5 border-b border-cinza-borda">
              <h2 className="font-bold text-azul-escuro flex items-center gap-2">
                <span>👤</span>
                Responsável
              </h2>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-azul-escuro rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {debug.campos_criticos?.ultimo_relacionador?.valor?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="font-semibold text-azul-escuro">
                    {debug.campos_criticos?.ultimo_relacionador?.valor || 'Não informado'}
                  </div>
                  <div className="text-xs text-cinza-medio">Último Relacionador</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Timestamp */}
          <div className="bg-gradient-to-br from-azul-escuro to-azul-sidebar rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🕐</span>
              <span className="font-semibold">Processamento</span>
            </div>
            <div className="text-sm opacity-80">
              {new Date().toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-white/20 text-xs opacity-70">
              Workflow Faturista v8 • N8N
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 bg-azul-escuro rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚀</span>
            <div>
              <div className="font-bold">Start Assessoria</div>
              <div className="text-sm opacity-70">Workflow Automático de Faturamento</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="opacity-70">Versão: V25</span>
            <span className="opacity-70">•</span>
            <a
              href={`https://startprev.bitrix24.com.br/crm/deal/details/${resumo.deal_id}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amarelo hover:underline"
            >
              Deal #{resumo.deal_id}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
