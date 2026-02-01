'use client';

import Link from 'next/link';
import { useState } from 'react';

// Lista de relatórios recentes (mock - seria buscado de uma API)
const relatoriosRecentes = [
  {
    deal_id: 119842,
    nome: "KARINA INACIO DE OLIVEIRA",
    status: "SUCESSO",
    valor_start: 1812.66,
    parcelas: "2/4",
    data: "31/01/2026 17:42",
  },
  {
    deal_id: 119840,
    nome: "MARIA SANTOS SILVA",
    status: "SUCESSO",
    valor_start: 3295.00,
    parcelas: "1/1",
    data: "31/01/2026 15:30",
  },
  {
    deal_id: 119835,
    nome: "ANA PAULA FERREIRA",
    status: "ALERTA",
    valor_start: 2150.00,
    parcelas: "3/5",
    data: "30/01/2026 14:20",
  },
];

export default function ListaFaturamento() {
  const [busca, setBusca] = useState('');

  const relatóriosFiltrados = relatoriosRecentes.filter(r =>
    r.nome.toLowerCase().includes(busca.toLowerCase()) ||
    r.deal_id.toString().includes(busca)
  );

  return (
    <div className="p-4 lg:p-8 animate-fadeIn">
      {/* Header */}
      <header className="bg-white rounded-xl p-6 mb-6 border border-cinza-borda shadow-sm">
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
          Relatórios de Criação de Fatura
        </h1>
        <p className="text-cinza-medio mt-1">
          Visualize os relatórios gerados pelo workflow de faturamento
        </p>
      </header>

      {/* Busca */}
      <div className="bg-white rounded-xl p-5 border border-cinza-borda shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-xs text-cinza-medio uppercase tracking-wider mb-2 block">
              Buscar por nome ou Deal ID
            </label>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Digite o nome do cliente ou número do deal..."
              className="w-full p-3 border border-cinza-borda rounded-lg focus:outline-none focus:border-azul-escuro"
            />
          </div>
          <div className="flex items-end">
            <Link
              href="/recebimento/relatorios/faturamento/119842"
              className="px-6 py-3 bg-azul-escuro hover:bg-azul-hover text-white rounded-lg font-medium transition-all flex items-center gap-2"
            >
              🔍 Ver Exemplo
            </Link>
          </div>
        </div>
      </div>

      {/* Lista de Relatórios */}
      <div className="bg-white rounded-xl border border-cinza-borda shadow-sm">
        <div className="p-5 border-b border-cinza-borda">
          <h2 className="font-bold text-azul-escuro flex items-center gap-2">
            📂 Relatórios Recentes
            <span className="text-xs bg-amarelo/20 text-amarelo-hover px-2 py-0.5 rounded-full">
              {relatóriosFiltrados.length}
            </span>
          </h2>
        </div>

        <div className="divide-y divide-cinza-borda">
          {relatóriosFiltrados.length === 0 ? (
            <div className="p-8 text-center text-cinza-medio">
              Nenhum relatório encontrado
            </div>
          ) : (
            relatóriosFiltrados.map((rel) => (
              <Link
                key={rel.deal_id}
                href={`/recebimento/relatorios/faturamento/${rel.deal_id}`}
                className="flex items-center gap-4 p-4 hover:bg-cinza-bg transition-all group"
              >
                {/* Status */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                  rel.status === 'SUCESSO'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-yellow-100 text-yellow-600'
                }`}>
                  {rel.status === 'SUCESSO' ? '✅' : '⚠️'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-azul-escuro truncate group-hover:text-amarelo-hover transition-colors">
                    {rel.nome}
                  </div>
                  <div className="text-xs text-cinza-medio">
                    Deal #{rel.deal_id} • {rel.data}
                  </div>
                </div>

                {/* Valores */}
                <div className="hidden md:block text-right">
                  <div className="font-semibold text-amarelo-hover">
                    R$ {rel.valor_start.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-cinza-medio">
                    Parcelas: {rel.parcelas}
                  </div>
                </div>

                {/* Seta */}
                <div className="text-cinza-medio group-hover:text-azul-escuro transition-colors">
                  →
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <h4 className="font-semibold text-blue-700 text-sm">Como funciona?</h4>
            <p className="text-xs text-blue-600 mt-1">
              Os relatórios são gerados automaticamente pelo workflow de faturamento no n8n.
              Ao clicar em um relatório, você verá todos os detalhes da criação da fatura,
              incluindo valores, explicações das decisões e links para o Bitrix.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
