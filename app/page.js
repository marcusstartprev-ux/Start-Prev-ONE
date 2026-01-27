'use client';

import Link from 'next/link';

export default function Dashboard() {
  const stats = [
    { icon: '💰', value: 'R$ 45.230', label: 'Recebido este mês', bg: 'bg-green-50' },
    { icon: '📅', value: 'R$ 12.500', label: 'A receber (7 dias)', bg: 'bg-amber-50' },
    { icon: '⚠️', value: 'R$ 8.320', label: 'Vencidas', bg: 'bg-red-50' },
    { icon: '👥', value: '127', label: 'Clientes ativos', bg: 'bg-gray-50' },
  ];

  const quickActions = [
    { icon: '📊', text: 'Gerar Relatório', href: '/recebimento/relatorios/gerador' },
    { icon: '⚠️', text: 'Ver Vencidas', href: '/recebimento/faturas' },
    { icon: '👥', text: 'Buscar Cliente', href: '/recebimento/clientes' },
    { icon: '💰', text: 'Todas Faturas', href: '/recebimento/faturas' },
  ];

  const activities = [
    { icon: '✅', title: 'Fatura recebida', desc: 'Maria Silva - R$ 1.250', time: '2min' },
    { icon: '📊', title: 'Relatório gerado', desc: 'Semanal - Jan/2026', time: '15min' },
    { icon: '⚠️', title: 'Fatura venceu', desc: 'João Santos - R$ 890', time: '1h' },
  ];

  return (
    <div className="p-4 lg:p-8 animate-fadeIn">
      {/* Header */}
      <header className="bg-white rounded-xl p-4 lg:p-6 mb-6 border border-cinza-borda shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-extrabold text-azul-escuro">
              👋 Bom dia, Marcus!
            </h1>
            <p className="text-cinza-medio text-sm mt-1">
              Aqui está o resumo do módulo de Recebimento
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <button className="w-10 h-10 bg-cinza-bg rounded-lg flex items-center justify-center hover:bg-cinza-borda transition-colors relative">
              🔔
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button className="w-10 h-10 bg-cinza-bg rounded-lg flex items-center justify-center hover:bg-cinza-borda transition-colors">
              ❓
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, idx) => (
          <div key={idx} className={`${stat.bg} rounded-xl p-5 border border-cinza-borda`}>
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl mb-4 shadow-sm">
              {stat.icon}
            </div>
            <div className="text-2xl font-extrabold text-azul-escuro">{stat.value}</div>
            <div className="text-sm text-cinza-medio">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-cinza-borda shadow-sm">
          <div className="p-5 border-b border-cinza-borda">
            <h2 className="font-bold text-azul-escuro">⚡ Ações Rápidas</h2>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action, idx) => (
                <Link
                  key={idx}
                  href={action.href}
                  className="flex items-center gap-3 p-4 bg-cinza-bg rounded-xl hover:bg-azul-escuro hover:text-white transition-all group"
                >
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-lg group-hover:bg-white/20 transition-colors">
                    {action.icon}
                  </div>
                  <span className="font-semibold text-sm">{action.text}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-cinza-borda shadow-sm">
          <div className="p-5 border-b border-cinza-borda">
            <h2 className="font-bold text-azul-escuro">📋 Atividade Recente</h2>
          </div>
          <div className="p-5 space-y-3">
            {activities.map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-cinza-bg rounded-lg">
                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-azul-escuro truncate">{activity.title}</div>
                  <div className="text-xs text-cinza-medio truncate">{activity.desc}</div>
                </div>
                <div className="text-[11px] text-cinza-claro">{activity.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
