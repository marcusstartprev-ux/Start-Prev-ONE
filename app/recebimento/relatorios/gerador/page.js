'use client';

import { useState, useEffect } from 'react';

export default function GeradorRelatorios() {
  const [responsaveis, setResponsaveis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historico, setHistorico] = useState([]);
  
  const [filtros, setFiltros] = useState({
    mesINSS: '',
    anoINSS: '2025',
    dataInicio: '',
    dataFim: '',
    responsavel: '',
    tipoRelatorio: 'completo',
    cliente: '',
    status: ['RECEBIDO', 'A_RECEBER', 'VENCIDO']
  });

  const CONFIG = {
    bitrixWebhook: 'https://startprev.bitrix24.com.br/rest/110798/u24r6sark33p1q3i',
    n8nWebhook: 'https://SEU_WEBHOOK_N8N/webhook/gerar-relatorio',
  };

  useEffect(() => {
    async function loadResponsaveis() {
      try {
        const response = await fetch(`${CONFIG.bitrixWebhook}/user.get`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ FILTER: { ACTIVE: 'Y', UF_DEPARTMENT: [228, 230] } })
        });
        const data = await response.json();
        
        if (data.result) {
          const usuarios = data.result
            .filter(u => u.NAME && !u.NAME.includes('AUTOMAÇÃO') && !u.NAME.includes('Relatórios'))
            .sort((a, b) => (a.NAME || '').localeCompare(b.NAME || ''));
          setResponsaveis(usuarios);
        }
      } catch (error) {
        console.error('Erro ao carregar responsáveis:', error);
      }
    }
    
    loadResponsaveis();
    const saved = localStorage.getItem('onestart_historico');
    if (saved) setHistorico(JSON.parse(saved));
  }, []);

  const toggleStatus = (status) => {
    setFiltros(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const presets = {
    mesAtual: () => {
      const hoje = new Date();
      setFiltros(prev => ({
        ...prev,
        mesINSS: String(hoje.getMonth() + 1).padStart(2, '0'),
        anoINSS: String(hoje.getFullYear()),
        dataInicio: '', dataFim: '',
        status: ['RECEBIDO', 'A_RECEBER', 'VENCIDO']
      }));
    },
    mesAnterior: () => {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      setFiltros(prev => ({
        ...prev,
        mesINSS: String(d.getMonth() + 1).padStart(2, '0'),
        anoINSS: String(d.getFullYear()),
        dataInicio: '', dataFim: '',
        status: ['RECEBIDO', 'A_RECEBER', 'VENCIDO']
      }));
    },
    semanaAtual: () => {
      const hoje = new Date();
      const inicio = new Date(hoje);
      inicio.setDate(hoje.getDate() - hoje.getDay() + 1);
      const fim = new Date(inicio);
      fim.setDate(inicio.getDate() + 6);
      
      setFiltros(prev => ({
        ...prev,
        mesINSS: '', anoINSS: '',
        dataInicio: inicio.toISOString().split('T')[0],
        dataFim: fim.toISOString().split('T')[0],
        status: ['RECEBIDO', 'A_RECEBER', 'VENCIDO']
      }));
    },
    inadimplentes: () => {
      setFiltros(prev => ({
        ...prev,
        mesINSS: '', anoINSS: '',
        dataInicio: '', dataFim: '',
        tipoRelatorio: 'inadimplentes',
        status: ['VENCIDO']
      }));
    }
  };

  const gerarRelatorio = async (e) => {
    e.preventDefault();
    
    if (!filtros.mesINSS && !filtros.dataInicio && !filtros.responsavel && !filtros.cliente) {
      alert('Selecione pelo menos um filtro!');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(CONFIG.n8nWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mes_inss: filtros.mesINSS,
          ano_inss: filtros.anoINSS,
          data_inicio: filtros.dataInicio,
          data_fim: filtros.dataFim,
          responsavel_id: filtros.responsavel,
          tipo_relatorio: filtros.tipoRelatorio,
          cliente: filtros.cliente,
          status: filtros.status
        })
      });

      const result = await response.json();

      if (result.success && result.url) {
        const novoItem = {
          tipo: filtros.tipoRelatorio,
          periodo: filtros.mesINSS ? `${filtros.mesINSS}/${filtros.anoINSS}` : 'Personalizado',
          url: result.url,
          data: new Date().toLocaleString('pt-BR')
        };
        
        const novoHistorico = [novoItem, ...historico].slice(0, 10);
        setHistorico(novoHistorico);
        localStorage.setItem('onestart_historico', JSON.stringify(novoHistorico));
        
        window.open(result.url, '_blank');
      } else {
        throw new Error(result.error || 'Erro ao gerar');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao gerar relatório. Verifique o webhook.');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { key: 'RECEBIDO', label: '✅ Recebidas' },
    { key: 'A_RECEBER', label: '📅 A Receber' },
    { key: 'VENCIDO', label: '⚠️ Vencidas' },
    { key: 'VENCENDO_HOJE', label: '🔔 Vence Hoje' },
  ];

  const tipoIcons = { completo: '📊', resumido: '📋', inadimplentes: '⚠️', recebidos: '✅', previsao: '🔮' };

  return (
    <div className="p-4 lg:p-8 animate-fadeIn">
      {/* Header */}
      <header className="bg-white rounded-xl p-4 lg:p-6 mb-6 border border-cinza-borda shadow-sm">
        <div className="flex items-center gap-2 text-sm text-cinza-medio mb-2">
          <span>Início</span><span>/</span>
          <span>Recebimento</span><span>/</span>
          <span>Relatórios</span><span>/</span>
          <span className="text-cinza-escuro font-medium">Gerador</span>
        </div>
        <h1 className="text-xl lg:text-2xl font-extrabold text-azul-escuro">
          📊 Gerador de Relatórios
        </h1>
        <p className="text-cinza-medio text-sm mt-1">
          Selecione os filtros e gere relatórios personalizados
        </p>
      </header>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filtros */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-cinza-borda shadow-sm">
          <div className="p-5 border-b border-cinza-borda flex items-center gap-2">
            <span>🎯</span>
            <h2 className="font-bold text-azul-escuro">Filtros do Relatório</h2>
          </div>
          
          <form onSubmit={gerarRelatorio} className="p-5">
            {/* Atalhos */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
              {[
                { label: '📅 Mês Atual', fn: presets.mesAtual },
                { label: '📅 Mês Anterior', fn: presets.mesAnterior },
                { label: '📆 Semana Atual', fn: presets.semanaAtual },
                { label: '⚠️ Inadimplentes', fn: presets.inadimplentes },
              ].map((btn, idx) => (
                <button key={idx} type="button" onClick={btn.fn} className="p-3 bg-cinza-bg rounded-lg text-xs font-semibold hover:bg-azul-escuro hover:text-white transition-all">
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Campos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-cinza-escuro mb-1">📆 Competência INSS (Mês)</label>
                <select 
                  value={filtros.mesINSS} 
                  onChange={e => setFiltros(prev => ({ ...prev, mesINSS: e.target.value }))}
                  className="w-full p-3 border border-cinza-borda rounded-lg focus:outline-none focus:border-azul-escuro"
                >
                  <option value="">Todos os meses</option>
                  {['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'].map((mes, idx) => (
                    <option key={idx} value={String(idx + 1).padStart(2, '0')}>{mes}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-cinza-escuro mb-1">📅 Ano INSS</label>
                <select 
                  value={filtros.anoINSS}
                  onChange={e => setFiltros(prev => ({ ...prev, anoINSS: e.target.value }))}
                  className="w-full p-3 border border-cinza-borda rounded-lg focus:outline-none focus:border-azul-escuro"
                >
                  <option value="">Todos</option>
                  {['2026','2025','2024','2023'].map(ano => <option key={ano} value={ano}>{ano}</option>)}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-cinza-escuro mb-1">📅 Período de Vencimento</label>
                <div className="flex items-center gap-3">
                  <input type="date" value={filtros.dataInicio} onChange={e => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))} className="flex-1 p-3 border border-cinza-borda rounded-lg focus:outline-none focus:border-azul-escuro" />
                  <span className="text-cinza-claro text-sm">até</span>
                  <input type="date" value={filtros.dataFim} onChange={e => setFiltros(prev => ({ ...prev, dataFim: e.target.value }))} className="flex-1 p-3 border border-cinza-borda rounded-lg focus:outline-none focus:border-azul-escuro" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-cinza-escuro mb-1">👤 Responsável</label>
                <select value={filtros.responsavel} onChange={e => setFiltros(prev => ({ ...prev, responsavel: e.target.value }))} className="w-full p-3 border border-cinza-borda rounded-lg focus:outline-none focus:border-azul-escuro">
                  <option value="">Todos os responsáveis</option>
                  {responsaveis.map(user => (
                    <option key={user.ID} value={user.ID}>{user.NAME} {user.LAST_NAME}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-cinza-escuro mb-1">📋 Tipo de Relatório</label>
                <select value={filtros.tipoRelatorio} onChange={e => setFiltros(prev => ({ ...prev, tipoRelatorio: e.target.value }))} className="w-full p-3 border border-cinza-borda rounded-lg focus:outline-none focus:border-azul-escuro">
                  <option value="completo">Completo</option>
                  <option value="resumido">Resumido</option>
                  <option value="inadimplentes">Apenas Inadimplentes</option>
                  <option value="recebidos">Apenas Recebidos</option>
                  <option value="previsao">Previsão</option>
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-cinza-escuro mb-1">👥 Cliente (Nome ou CPF)</label>
                <input type="text" value={filtros.cliente} onChange={e => setFiltros(prev => ({ ...prev, cliente: e.target.value }))} placeholder="Digite o nome ou CPF (opcional)" className="w-full p-3 border border-cinza-borda rounded-lg focus:outline-none focus:border-azul-escuro" />
              </div>
            </div>

            {/* Status */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-semibold text-cinza-claro uppercase tracking-wide">Status das Faturas</span>
                <div className="flex-1 h-px bg-cinza-borda" />
              </div>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map(opt => (
                  <button key={opt.key} type="button" onClick={() => toggleStatus(opt.key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${filtros.status.includes(opt.key) ? 'bg-azul-escuro text-white' : 'bg-cinza-bg text-cinza-escuro hover:bg-cinza-borda'}`}>
                    {filtros.status.includes(opt.key) && <span>✓</span>}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="w-full p-4 bg-azul-escuro text-white rounded-xl font-bold text-base hover:bg-azul-hover transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? (
                <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Gerando...</>
              ) : (
                <>🚀 Gerar Relatório</>
              )}
            </button>
          </form>
        </div>

        {/* Histórico */}
        <div className="bg-white rounded-xl border border-cinza-borda shadow-sm">
          <div className="p-5 border-b border-cinza-borda flex items-center gap-2">
            <span>📂</span>
            <h2 className="font-bold text-azul-escuro">Últimos Relatórios</h2>
          </div>
          <div className="p-5">
            {historico.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3 opacity-50">📂</div>
                <p className="text-cinza-medio text-sm">Nenhum relatório gerado ainda.<br />Use os filtros para criar!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {historico.map((item, idx) => (
                  <a key={idx} href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-cinza-bg rounded-lg hover:bg-cinza-borda transition-all group">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-lg">{tipoIcons[item.tipo] || '📄'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-azul-escuro capitalize truncate">{item.tipo} - {item.periodo}</div>
                      <div className="text-xs text-cinza-medio">{item.data}</div>
                    </div>
                    <span className="text-cinza-claro group-hover:text-azul-escuro">→</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-10 rounded-2xl text-center shadow-xl">
            <div className="w-12 h-12 border-4 border-cinza-borda border-t-azul-escuro rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-bold text-azul-escuro">Gerando relatório...</h3>
            <p className="text-sm text-cinza-medio">Buscando dados do Bitrix</p>
          </div>
        </div>
      )}
    </div>
  );
}
