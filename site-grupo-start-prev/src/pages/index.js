export default function Home() {
  return (
    <div className="container">
      <header>
        <img src="/logo-start-prev.png" alt="Grupo Start Prev" className="logo" />
      </header>

      <main>
        <h1>Grupo Start Prev</h1>
        <p>Assessoria especializada em Salário Maternidade</p>

        <div className="services">
          <div className="service-card">
            <span className="emoji">🌾</span>
            <h3>Salário Maternidade Rural</h3>
            <p>Especialistas em benefícios para trabalhadoras rurais</p>
          </div>

          <div className="service-card">
            <span className="emoji">💼</span>
            <h3>Salário Maternidade CLT</h3>
            <p>Assessoria para trabalhadoras com carteira assinada</p>
          </div>

          <div className="service-card">
            <span className="emoji">🏪</span>
            <h3>Salário Maternidade MEI</h3>
            <p>Suporte para microempreendedoras individuais</p>
          </div>
        </div>
      </main>

      <footer>
        <p>&copy; 2025 Grupo Start Prev. Todos os direitos reservados.</p>
      </footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        header {
          padding: 20px;
          display: flex;
          justify-content: center;
        }

        .logo {
          height: 80px;
          width: auto;
        }

        main {
          flex: 1;
          padding: 40px 20px;
          text-align: center;
        }

        h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
          background: linear-gradient(90deg, #ff6b35, #ff8c42);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        main > p {
          font-size: 1.2rem;
          color: #888;
          margin-bottom: 60px;
        }

        .services {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .service-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 32px 24px;
          transition: transform 0.3s, border-color 0.3s;
        }

        .service-card:hover {
          transform: translateY(-4px);
          border-color: #ff6b35;
        }

        .emoji {
          font-size: 3rem;
          display: block;
          margin-bottom: 16px;
        }

        .service-card h3 {
          font-size: 1.25rem;
          margin-bottom: 12px;
          color: #ff6b35;
        }

        .service-card p {
          color: #aaa;
          line-height: 1.6;
        }

        footer {
          padding: 30px;
          text-align: center;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        footer p {
          color: #666;
          font-size: 0.875rem;
        }
      `}</style>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          background: #0f0f1a;
        }
      `}</style>
    </div>
  );
}
