/**
 * GERADOR DE HTML PARA RELATÓRIO DE FATURA - START ASSESSORIA
 *
 * Este script gera um HTML completo e profissional para ser inserido
 * no campo da fatura no Bitrix24 via workflow do n8n.
 *
 * Uso no n8n (Nó 12 - Gerar Relatório HTML):
 *
 * const dados = $input.first().json;
 * const html = gerarHTMLRelatorio(dados);
 * return { ...dados, html_relatorio: html };
 */

function gerarHTMLRelatorio(dados) {
  const { resumo, debug, auditoria, tags, status, anti_dup, body } = dados;

  // Helpers
  const formatarData = (dataISO) => {
    if (!dataISO) return '-';
    try {
      const data = new Date(dataISO);
      return data.toLocaleDateString('pt-BR');
    } catch {
      return dataISO;
    }
  };

  const formatarMoeda = (valor) => {
    if (!valor && valor !== 0) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Classificar status
  const statusGeral = auditoria?.total_problemas === 0 ? 'sucesso' : auditoria?.total_alertas > 0 ? 'alerta' : 'erro';
  const statusConfig = {
    sucesso: { bg: '#10B981', text: 'Processado com Sucesso', icon: '✓' },
    alerta: { bg: '#F59E0B', text: 'Processado com Alertas', icon: '⚠' },
    erro: { bg: '#EF4444', text: 'Erro no Processamento', icon: '✕' }
  };

  // Classificar tags
  const classificarTag = (tag) => {
    if (tag.startsWith('OK_') || (tag.startsWith('TAG_') && tag.includes('_OK'))) return 'success';
    if (tag.startsWith('ERRO_') || tag.startsWith('E_')) return 'error';
    if (tag.startsWith('ALERTA_') || tag.startsWith('A_') || tag.includes('AUSENTE')) return 'warning';
    if (tag.startsWith('INFO_')) return 'info';
    return 'neutral';
  };

  const tagCores = {
    success: { bg: '#D1FAE5', text: '#065F46', border: '#A7F3D0' },
    error: { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' },
    warning: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
    info: { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' },
    neutral: { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' }
  };

  // Calcular progresso
  const progressoCobranca = resumo?.total_start > 0
    ? ((resumo.total_start - (resumo.saldo_start_final || 0)) / resumo.total_start) * 100
    : 100;

  // Gerar tags HTML (limitado a 15)
  const tagsVisiveis = (tags || []).slice(0, 15);
  const tagsHTML = tagsVisiveis.map(tag => {
    const tipo = classificarTag(tag);
    const cores = tagCores[tipo];
    return `<span style="display:inline-block;background:${cores.bg};color:${cores.text};border:1px solid ${cores.border};padding:2px 8px;border-radius:12px;font-size:10px;margin:2px;">${tag.replace(/^(OK_|TAG_|ERRO_|ALERTA_|INFO_)/, '')}</span>`;
  }).join(' ');

  // Gerar validações HTML
  const validacoes = auditoria?.validacoes || {};
  const validacoesHTML = Object.entries(validacoes).map(([key, value]) => {
    const nome = key.replace(/_ok$/i, '').replace(/_/g, ' ').toUpperCase();
    const cor = value ? '#10B981' : '#EF4444';
    const icon = value ? '✓' : '✕';
    return `<div style="display:inline-flex;align-items:center;gap:4px;background:${value ? '#D1FAE5' : '#FEE2E2'};padding:4px 8px;border-radius:6px;font-size:10px;margin:2px;">
      <span style="color:${cor}">${icon}</span>
      <span style="color:#374151">${nome}</span>
    </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório - ${resumo?.nome || 'Fatura'}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%);
      padding: 16px;
      color: #374151;
      font-size: 13px;
      line-height: 1.5;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: #FFFFFF;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #1A2332 0%, #151B27 100%);
      color: white;
      padding: 24px;
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 16px;
    }
    .header h1 {
      font-size: 22px;
      font-weight: 800;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .header-icon {
      width: 44px;
      height: 44px;
      background: rgba(255,255,255,0.1);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
    }
    .header-sub {
      font-size: 13px;
      opacity: 0.85;
      margin-top: 4px;
    }
    .status-badge {
      background: ${statusConfig[statusGeral].bg};
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .deal-link {
      background: rgba(255,255,255,0.1);
      color: white;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 12px;
      text-decoration: none;
      margin-top: 8px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.2s;
    }
    .deal-link:hover { background: rgba(255,255,255,0.2); }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      padding: 20px;
      background: #F9FAFB;
    }
    @media (max-width: 600px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 16px;
      text-align: center;
      border: 1px solid #E5E7EB;
    }
    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      margin: 0 auto 10px;
    }
    .stat-value {
      font-size: 18px;
      font-weight: 800;
      color: #1A2332;
    }
    .stat-label {
      font-size: 11px;
      color: #6B7280;
      margin-top: 4px;
    }

    .section {
      padding: 20px;
      border-bottom: 1px solid #E5E7EB;
    }
    .section:last-child { border-bottom: none; }
    .section-title {
      font-size: 15px;
      font-weight: 700;
      color: #1A2332;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-title span { font-size: 18px; }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    @media (max-width: 500px) { .info-grid { grid-template-columns: 1fr; } }
    .info-grid-4 { grid-template-columns: repeat(4, 1fr); }
    @media (max-width: 600px) { .info-grid-4 { grid-template-columns: repeat(2, 1fr); } }

    .info-item {
      background: #F9FAFB;
      border-radius: 10px;
      padding: 12px;
    }
    .info-item.highlight {
      background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
      grid-column: span 2;
    }
    .info-label {
      font-size: 10px;
      color: #9CA3AF;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .info-value {
      font-size: 14px;
      font-weight: 600;
      color: #1A2332;
    }
    .info-value.money { color: #10B981; }
    .info-value.primary { color: #3B82F6; }

    .progress-bar {
      margin: 16px 0;
    }
    .progress-label {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      margin-bottom: 6px;
    }
    .progress-track {
      height: 10px;
      background: #E5E7EB;
      border-radius: 5px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #1A2332 0%, #10B981 100%);
      border-radius: 5px;
      transition: width 0.5s ease;
    }

    .totals-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 16px;
    }
    @media (max-width: 500px) { .totals-grid { grid-template-columns: 1fr; } }
    .total-card {
      text-align: center;
      padding: 16px;
      border-radius: 12px;
      border: 2px solid;
    }
    .total-card.blue { background: #EFF6FF; border-color: #BFDBFE; }
    .total-card.green { background: #ECFDF5; border-color: #A7F3D0; }
    .total-card.purple { background: #F5F3FF; border-color: #DDD6FE; }
    .total-icon { font-size: 24px; margin-bottom: 8px; }
    .total-label { font-size: 10px; color: #6B7280; text-transform: uppercase; }
    .total-value { font-size: 20px; font-weight: 800; margin-top: 4px; }
    .total-card.blue .total-value { color: #1D4ED8; }
    .total-card.green .total-value { color: #059669; }
    .total-card.purple .total-value { color: #7C3AED; }

    .fatura-card {
      background: linear-gradient(135deg, #FFFFFF 0%, #ECFDF5 100%);
      border: 2px solid #A7F3D0;
      border-radius: 14px;
      padding: 20px;
      position: relative;
    }
    .fatura-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .fatura-parcela {
      font-size: 11px;
      color: #059669;
      text-transform: uppercase;
      font-weight: 600;
    }
    .fatura-competencia {
      font-size: 18px;
      font-weight: 700;
      color: #1A2332;
    }
    .fatura-status {
      background: #10B981;
      color: white;
      padding: 6px 14px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
    }
    .fatura-valores {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }
    @media (max-width: 500px) { .fatura-valores { grid-template-columns: 1fr; } }
    .fatura-valor-item label {
      font-size: 10px;
      color: #6B7280;
    }
    .fatura-valor-item .value {
      font-size: 16px;
      font-weight: 700;
    }
    .fatura-valor-item .value.blue { color: #1D4ED8; }
    .fatura-valor-item .value.green { color: #059669; }
    .fatura-valor-item .value.purple { color: #7C3AED; }

    .fatura-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 16px;
    }
    .fatura-tag {
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
    }
    .fatura-tag.yellow { background: #FEF3C7; color: #92400E; }
    .fatura-tag.blue { background: #DBEAFE; color: #1E40AF; }

    .explicacao-box {
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      border-radius: 10px;
      padding: 14px;
      margin-bottom: 16px;
    }
    .explicacao-box .title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
      color: #1D4ED8;
      margin-bottom: 6px;
    }
    .explicacao-box .text {
      font-size: 12px;
      color: #3B82F6;
    }

    .btn-bitrix {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      background: #1A2332;
      color: white;
      padding: 14px;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      transition: background 0.2s;
    }
    .btn-bitrix:hover { background: #252D3D; }

    .auditoria-status {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }
    .auditoria-card {
      text-align: center;
      padding: 16px;
      border-radius: 12px;
    }
    .auditoria-card.success { background: #ECFDF5; border: 1px solid #A7F3D0; }
    .auditoria-card.warning { background: #FEF3C7; border: 1px solid #FDE68A; }
    .auditoria-card.error { background: #FEE2E2; border: 1px solid #FECACA; }
    .auditoria-icon { font-size: 28px; }
    .auditoria-value { font-size: 24px; font-weight: 800; margin: 4px 0; }
    .auditoria-label { font-size: 12px; color: #6B7280; }

    .tags-container {
      background: #F9FAFB;
      border-radius: 10px;
      padding: 12px;
      margin-top: 12px;
    }
    .tags-title {
      font-size: 12px;
      font-weight: 600;
      color: #1A2332;
      margin-bottom: 8px;
    }

    .footer {
      background: #1A2332;
      color: white;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .footer-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .footer-brand-icon { font-size: 28px; }
    .footer-brand-name { font-weight: 700; font-size: 16px; }
    .footer-brand-sub { font-size: 12px; opacity: 0.7; }
    .footer-info {
      font-size: 12px;
      opacity: 0.8;
      text-align: right;
    }
    .footer-link {
      color: #F59E0B;
      text-decoration: none;
    }
    .footer-link:hover { text-decoration: underline; }

    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; }
      .btn-bitrix { display: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- HEADER -->
    <div class="header">
      <div class="header-top">
        <div>
          <h1>
            <div class="header-icon">📋</div>
            Relatório de Faturamento
          </h1>
          <div class="header-sub">${body?.fields?.title || `Fatura ${debug?.parcela || 1}/${debug?.total_parcelas || 1}`}</div>
        </div>
        <div style="text-align: right;">
          <div class="status-badge">
            <span>${statusConfig[statusGeral].icon}</span>
            ${statusConfig[statusGeral].text}
          </div>
          <a href="https://startprev.bitrix24.com.br/crm/deal/details/${resumo?.deal_id}/" target="_blank" class="deal-link">
            🔗 Deal #${resumo?.deal_id}
          </a>
        </div>
      </div>
    </div>

    <!-- STATS CARDS -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: #DBEAFE;">💰</div>
        <div class="stat-value">${resumo?.total_120_dias_formatado || formatarMoeda(resumo?.total_120_dias)}</div>
        <div class="stat-label">Total INSS</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #D1FAE5;">🏢</div>
        <div class="stat-value" style="color: #059669;">${resumo?.total_start_formatado || formatarMoeda(resumo?.total_start)}</div>
        <div class="stat-label">Honorários Start</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #EDE9FE;">👤</div>
        <div class="stat-value" style="color: #7C3AED;">${resumo?.total_cliente_formatado || formatarMoeda(resumo?.total_cliente)}</div>
        <div class="stat-label">Valor Cliente</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #FEF3C7;">📊</div>
        <div class="stat-value" style="color: #D97706;">${resumo?.aliquota_honorarios_formatada || ((resumo?.aliquota_honorarios || 0.3) * 100).toFixed(0) + '%'}</div>
        <div class="stat-label">Alíquota</div>
      </div>
    </div>

    <!-- BENEFICIÁRIO -->
    <div class="section">
      <div class="section-title"><span>👤</span> Dados do Beneficiário</div>
      <div class="info-grid">
        <div class="info-item highlight">
          <div class="info-label">Nome Completo</div>
          <div class="info-value primary">${resumo?.nome || '-'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">CPF</div>
          <div class="info-value">${resumo?.cpf_formatado || '-'} ${resumo?.cpf_match ? '✓' : ''}</div>
        </div>
        <div class="info-item">
          <div class="info-label">NB (Número do Benefício)</div>
          <div class="info-value">${resumo?.nb_formatado || '-'} ${resumo?.nb_match ? '✓' : ''}</div>
        </div>
        <div class="info-item">
          <div class="info-label">NIT</div>
          <div class="info-value">${debug?.campos_criticos?.nit?.valor || '-'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">MR (Média de Remuneração)</div>
          <div class="info-value money">${resumo?.mr_formatado || formatarMoeda(resumo?.mr)}</div>
        </div>
      </div>

      <div style="margin-top: 20px;">
        <div class="section-title" style="margin-bottom: 12px;"><span>📅</span> Datas do Benefício</div>
        <div class="info-grid info-grid-4">
          <div class="info-item" style="background: #EFF6FF; text-align: center;">
            <div class="info-label" style="color: #3B82F6;">DIB</div>
            <div class="info-value">${formatarData(resumo?.dib)}</div>
          </div>
          <div class="info-item" style="background: #FEF2F2; text-align: center;">
            <div class="info-label" style="color: #EF4444;">DCB</div>
            <div class="info-value">${formatarData(resumo?.dcb)}</div>
          </div>
          <div class="info-item" style="background: #F5F3FF; text-align: center;">
            <div class="info-label" style="color: #8B5CF6;">Dias Totais</div>
            <div class="info-value">${resumo?.dias_totais || 120}</div>
          </div>
          <div class="info-item" style="background: #FEF3C7; text-align: center;">
            <div class="info-label" style="color: #D97706;">Competência</div>
            <div class="info-value">${debug?.competencia || '-'}</div>
          </div>
        </div>
      </div>

      ${resumo?.tem_13o ? `
      <div style="margin-top: 16px; background: linear-gradient(90deg, #FEF3C7 0%, #FEF9C3 100%); border: 1px solid #FDE68A; border-radius: 10px; padding: 14px; display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 28px;">🎄</span>
        <div>
          <div style="font-size: 13px; font-weight: 600; color: #1A2332;">Inclui 13º Salário</div>
          <div style="font-size: 18px; font-weight: 800; color: #D97706;">${resumo?.valor_13o_formatado || formatarMoeda(resumo?.valor_13o)}</div>
        </div>
      </div>
      ` : ''}
    </div>

    <!-- VALORES -->
    <div class="section">
      <div class="section-title"><span>💰</span> Resumo Financeiro</div>

      <div class="progress-bar">
        <div class="progress-label">
          <span style="color: #6B7280;">Progresso da Cobrança</span>
          <span style="font-weight: 700; color: #1A2332;">${progressoCobranca.toFixed(0)}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${progressoCobranca}%;"></div>
        </div>
      </div>

      <div class="totals-grid">
        <div class="total-card blue">
          <div class="total-icon">🏦</div>
          <div class="total-label">Total INSS</div>
          <div class="total-value">${resumo?.total_120_dias_formatado || formatarMoeda(resumo?.total_120_dias)}</div>
        </div>
        <div class="total-card green">
          <div class="total-icon">🏢</div>
          <div class="total-label">Honorários Start</div>
          <div class="total-value">${resumo?.total_start_formatado || formatarMoeda(resumo?.total_start)}</div>
        </div>
        <div class="total-card purple">
          <div class="total-icon">👤</div>
          <div class="total-label">Valor Cliente</div>
          <div class="total-value">${resumo?.total_cliente_formatado || formatarMoeda(resumo?.total_cliente)}</div>
        </div>
      </div>

      <div style="margin-top: 16px; background: #F3F4F6; border-radius: 10px; padding: 14px;">
        <div style="font-size: 12px; font-weight: 600; color: #1A2332; margin-bottom: 8px;">📐 Cálculo Aplicado</div>
        <div style="font-family: monospace; font-size: 13px; background: white; padding: 10px; border-radius: 6px; color: #374151;">
          ${resumo?.total_120_dias_formatado || formatarMoeda(resumo?.total_120_dias)} × ${resumo?.aliquota_honorarios_formatada || ((resumo?.aliquota_honorarios || 0.3) * 100).toFixed(0) + '%'} = ${resumo?.total_start_formatado || formatarMoeda(resumo?.total_start)}
        </div>
      </div>
    </div>

    <!-- FATURA -->
    <div class="section">
      <div class="section-title"><span>📋</span> Fatura Criada</div>

      <div class="fatura-card">
        <div class="fatura-header">
          <div>
            <div class="fatura-parcela">Parcela ${debug?.parcela || 1} de ${debug?.total_parcelas || 1}</div>
            <div class="fatura-competencia">Competência ${debug?.competencia || '-'}</div>
          </div>
          <div class="fatura-status">✓ ${debug?.regra === 'QUITACAO' ? 'QUITAÇÃO' : status || 'CRIADA'}</div>
        </div>

        <div class="fatura-valores">
          <div class="fatura-valor-item">
            <label>Valor INSS</label>
            <div class="value blue">${formatarMoeda(debug?.valor_inss)}</div>
          </div>
          <div class="fatura-valor-item">
            <label>Valor Start</label>
            <div class="value green">${formatarMoeda(debug?.valor_start)}</div>
          </div>
          <div class="fatura-valor-item">
            <label>Valor Cliente</label>
            <div class="value purple">${formatarMoeda(debug?.valor_cliente)}</div>
          </div>
        </div>

        <div class="fatura-tags">
          <span class="fatura-tag yellow">Alíquota: ${((debug?.aliquota_start || 0.3) * 100).toFixed(0)}%</span>
          <span class="fatura-tag blue">Regra: ${debug?.regra || '-'}</span>
        </div>

        <div class="explicacao-box">
          <div class="title">💡 Por que ${((debug?.aliquota_start || 0.3) * 100).toFixed(0)}%?</div>
          <div class="text">
            ${debug?.aliquota_start >= 0.28 && debug?.aliquota_start <= 0.30 ? 'Valor do benefício na faixa até R$ 10.000 - aplica-se alíquota padrão de 30%' : ''}
            ${debug?.aliquota_start >= 0.24 && debug?.aliquota_start <= 0.26 ? 'Valor do benefício na faixa de R$ 10.001 a R$ 20.000 - aplica-se alíquota de 25%' : ''}
            ${debug?.aliquota_start >= 0.19 && debug?.aliquota_start <= 0.21 ? 'Valor do benefício acima de R$ 20.000 - aplica-se alíquota de 20%' : ''}
          </div>
        </div>

        <a href="https://startprev.bitrix24.com.br/crm/deal/details/${resumo?.deal_id}/" target="_blank" class="btn-bitrix">
          🔗 Abrir Fatura no Bitrix
        </a>
      </div>
    </div>

    <!-- AUDITORIA -->
    <div class="section">
      <div class="section-title"><span>🔍</span> Auditoria</div>

      <div class="auditoria-status">
        <div class="auditoria-card ${auditoria?.total_problemas === 0 ? 'success' : 'error'}">
          <div class="auditoria-icon">${auditoria?.total_problemas === 0 ? '✅' : '❌'}</div>
          <div class="auditoria-value">${auditoria?.total_problemas || 0}</div>
          <div class="auditoria-label">Problemas</div>
        </div>
        <div class="auditoria-card ${auditoria?.total_alertas === 0 ? 'success' : 'warning'}">
          <div class="auditoria-icon">${auditoria?.total_alertas === 0 ? '✅' : '⚠️'}</div>
          <div class="auditoria-value">${auditoria?.total_alertas || 0}</div>
          <div class="auditoria-label">Alertas</div>
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        <div style="font-size: 13px; font-weight: 600; color: #1A2332; margin-bottom: 10px;">Validações</div>
        <div style="display: flex; flex-wrap: wrap; gap: 4px;">
          ${validacoesHTML}
        </div>
      </div>

      <div class="tags-container">
        <div class="tags-title">🏷️ Tags Geradas (${tags?.length || 0})</div>
        <div style="display: flex; flex-wrap: wrap;">
          ${tagsHTML}
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <div class="footer-brand">
        <div class="footer-brand-icon">🚀</div>
        <div>
          <div class="footer-brand-name">Start Assessoria</div>
          <div class="footer-brand-sub">Workflow Automático de Faturamento</div>
        </div>
      </div>
      <div class="footer-info">
        <div>${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
        <div>Versão: ${dados._versao || 'V25'} • <a href="https://startprev.bitrix24.com.br/crm/deal/details/${resumo?.deal_id}/" target="_blank" class="footer-link">Deal #${resumo?.deal_id}</a></div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// Exportar para uso no n8n
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { gerarHTMLRelatorio };
}

// Exportar para uso como ESModule
if (typeof exports !== 'undefined') {
  exports.gerarHTMLRelatorio = gerarHTMLRelatorio;
}
