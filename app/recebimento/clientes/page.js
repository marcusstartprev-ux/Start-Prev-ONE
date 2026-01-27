export default function Clientes() {
  return (
    <div className="p-4 lg:p-8 animate-fadeIn">
      <header className="bg-white rounded-xl p-4 lg:p-6 mb-6 border border-cinza-borda shadow-sm">
        <div className="flex items-center gap-2 text-sm text-cinza-medio mb-2">
          <span>Início</span><span>/</span><span>Recebimento</span><span>/</span>
          <span className="text-cinza-escuro font-medium">Clientes</span>
        </div>
        <h1 className="text-xl lg:text-2xl font-extrabold text-azul-escuro">👥 Clientes</h1>
        <p className="text-cinza-medio text-sm mt-1">Gerencie os clientes do módulo de Recebimento</p>
      </header>
      <div className="bg-white rounded-xl border border-cinza-borda shadow-sm p-10 text-center">
        <div className="text-5xl mb-4">🚧</div>
        <h2 className="text-xl font-bold text-azul-escuro mb-2">Em Desenvolvimento</h2>
        <p className="text-cinza-medio">Esta página estará disponível em breve.</p>
      </div>
    </div>
  );
}
