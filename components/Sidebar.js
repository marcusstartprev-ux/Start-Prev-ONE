'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState(['relatorios']);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMenu = (menu) => {
    setOpenMenus(prev => 
      prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]
    );
  };

  const isActive = (path) => pathname === path;
  const isParentActive = (paths) => paths.some(p => pathname.startsWith(p));

  return (
    <>
      {/* Overlay mobile */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Botão mobile */}
      <button 
        className="fixed top-4 left-4 z-50 lg:hidden bg-azul-escuro text-white p-2 rounded-lg shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 bottom-0 w-[260px] bg-azul-sidebar text-white
        flex flex-col z-50 transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <h1 className="text-2xl font-extrabold tracking-tight">
            One<span className="text-amarelo">Start</span>
          </h1>
          <p className="text-[11px] text-cinza-claro mt-1 uppercase tracking-wider">
            Start Assessoria
          </p>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {/* PRINCIPAL */}
          <div className="mb-6">
            <div className="text-[10px] font-bold text-cinza-medio uppercase tracking-wider px-3 mb-2">
              Principal
            </div>
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={`
                relative flex items-center gap-3 px-3 py-3 rounded-lg
                text-sm font-medium transition-all
                ${isActive('/') ? 'bg-azul-ativo text-white' : 'text-cinza-claro hover:bg-azul-hover hover:text-white'}
              `}
            >
              {isActive('/') && <span className="absolute left-0 w-[3px] h-6 bg-amarelo rounded-r" />}
              <span className="w-5 text-center">🏠</span>
              <span>Dashboard</span>
            </Link>
          </div>

          {/* RECEBIMENTO */}
          <div className="mb-6">
            <div className="text-[10px] font-bold text-cinza-medio uppercase tracking-wider px-3 mb-2">
              Recebimento
            </div>
            
            {/* Relatórios */}
            <button
              onClick={() => toggleMenu('relatorios')}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-lg
                text-sm font-medium transition-all cursor-pointer
                ${isParentActive(['/recebimento/relatorios']) 
                  ? 'bg-azul-ativo text-white' 
                  : 'text-cinza-claro hover:bg-azul-hover hover:text-white'}
              `}
            >
              <span className="w-5 text-center">📊</span>
              <span>Relatórios</span>
              <span className={`ml-auto text-xs transition-transform ${openMenus.includes('relatorios') ? 'rotate-90' : ''}`}>›</span>
            </button>
            
            {openMenus.includes('relatorios') && (
              <div className="ml-8 mt-1 space-y-1">
                <Link
                  href="/recebimento/relatorios/gerador"
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-md text-[13px] font-medium transition-all
                    ${isActive('/recebimento/relatorios/gerador') ? 'text-amarelo bg-amarelo/10' : 'text-cinza-claro hover:bg-azul-hover hover:text-white'}
                  `}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive('/recebimento/relatorios/gerador') ? 'bg-amarelo' : 'bg-cinza-medio'}`} />
                  Gerador
                </Link>
                <Link
                  href="/recebimento/relatorios/historico"
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-md text-[13px] font-medium transition-all
                    ${isActive('/recebimento/relatorios/historico') ? 'text-amarelo bg-amarelo/10' : 'text-cinza-claro hover:bg-azul-hover hover:text-white'}
                  `}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive('/recebimento/relatorios/historico') ? 'bg-amarelo' : 'bg-cinza-medio'}`} />
                  Histórico
                </Link>
                <Link
                  href="/recebimento/relatorios/faturamento"
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-md text-[13px] font-medium transition-all
                    ${isActive('/recebimento/relatorios/faturamento') ? 'text-amarelo bg-amarelo/10' : 'text-cinza-claro hover:bg-azul-hover hover:text-white'}
                  `}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive('/recebimento/relatorios/faturamento') ? 'bg-amarelo' : 'bg-cinza-medio'}`} />
                  Faturamento
                  <span className="ml-auto bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">NEW</span>
                </Link>
              </div>
            )}

            {/* Faturas */}
            <button
              onClick={() => toggleMenu('faturas')}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-lg mt-1
                text-sm font-medium transition-all cursor-pointer
                ${isParentActive(['/recebimento/faturas']) 
                  ? 'bg-azul-ativo text-white' 
                  : 'text-cinza-claro hover:bg-azul-hover hover:text-white'}
              `}
            >
              <span className="w-5 text-center">💰</span>
              <span>Faturas</span>
              <span className="ml-auto bg-amarelo text-azul-escuro text-[10px] font-bold px-2 py-0.5 rounded-full">12</span>
              <span className={`text-xs transition-transform ${openMenus.includes('faturas') ? 'rotate-90' : ''}`}>›</span>
            </button>
            
            {openMenus.includes('faturas') && (
              <div className="ml-8 mt-1 space-y-1">
                <Link
                  href="/recebimento/faturas"
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-md text-[13px] font-medium transition-all
                    ${isActive('/recebimento/faturas') ? 'text-amarelo bg-amarelo/10' : 'text-cinza-claro hover:bg-azul-hover hover:text-white'}
                  `}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive('/recebimento/faturas') ? 'bg-amarelo' : 'bg-cinza-medio'}`} />
                  Todas
                </Link>
              </div>
            )}

            {/* Clientes */}
            <Link
              href="/recebimento/clientes"
              onClick={() => setMobileOpen(false)}
              className={`
                relative flex items-center gap-3 px-3 py-3 rounded-lg mt-1
                text-sm font-medium transition-all
                ${isActive('/recebimento/clientes') ? 'bg-azul-ativo text-white' : 'text-cinza-claro hover:bg-azul-hover hover:text-white'}
              `}
            >
              {isActive('/recebimento/clientes') && <span className="absolute left-0 w-[3px] h-6 bg-amarelo rounded-r" />}
              <span className="w-5 text-center">👥</span>
              <span>Clientes</span>
            </Link>

            {/* Inadimplentes */}
            <Link
              href="/recebimento/inadimplentes"
              onClick={() => setMobileOpen(false)}
              className={`
                relative flex items-center gap-3 px-3 py-3 rounded-lg mt-1
                text-sm font-medium transition-all
                ${isActive('/recebimento/inadimplentes') ? 'bg-azul-ativo text-white' : 'text-cinza-claro hover:bg-azul-hover hover:text-white'}
              `}
            >
              {isActive('/recebimento/inadimplentes') && <span className="absolute left-0 w-[3px] h-6 bg-amarelo rounded-r" />}
              <span className="w-5 text-center">⚠️</span>
              <span>Inadimplentes</span>
              <span className="ml-auto bg-amarelo text-azul-escuro text-[10px] font-bold px-2 py-0.5 rounded-full">5</span>
            </Link>
          </div>

          {/* COMERCIAL */}
          <div className="mb-6">
            <div className="text-[10px] font-bold text-cinza-medio uppercase tracking-wider px-3 mb-2">
              Comercial
            </div>
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-cinza-claro opacity-50 cursor-not-allowed">
              <span className="w-5 text-center">🎯</span>
              <span>Leads</span>
              <span className="ml-auto bg-cinza-medio text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Breve</span>
            </div>
          </div>

          {/* SISTEMA */}
          <div className="mb-6">
            <div className="text-[10px] font-bold text-cinza-medio uppercase tracking-wider px-3 mb-2">
              Sistema
            </div>
            <Link
              href="/config"
              onClick={() => setMobileOpen(false)}
              className={`
                relative flex items-center gap-3 px-3 py-3 rounded-lg
                text-sm font-medium transition-all
                ${isActive('/config') ? 'bg-azul-ativo text-white' : 'text-cinza-claro hover:bg-azul-hover hover:text-white'}
              `}
            >
              {isActive('/config') && <span className="absolute left-0 w-[3px] h-6 bg-amarelo rounded-r" />}
              <span className="w-5 text-center">⚙️</span>
              <span>Configurações</span>
            </Link>
          </div>
        </nav>

        {/* Footer - User */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-azul-hover cursor-pointer transition-all">
            <div className="w-9 h-9 bg-amarelo text-azul-escuro rounded-lg flex items-center justify-center font-bold text-sm">
              M
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-semibold">Marcus Viniccius</div>
              <div className="text-[11px] text-cinza-claro">Administrador</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
