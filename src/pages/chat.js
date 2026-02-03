import { useRouter } from 'next/router';
import { useState, useRef, useEffect } from 'react';

function gerarMensagemInicial(params) {
  const nome = params.nome || 'Cliente';
  const primeiroNome = nome.split(' ')[0];
  const primeiroNomeFormatado = primeiroNome.charAt(0).toUpperCase() + primeiroNome.slice(1).toLowerCase();

  let tipoBeneficio = '';
  let emojiBeneficio = '';
  const classificacao = (params.classificacao || '').toUpperCase();

  if (classificacao.includes('RURAL')) {
    tipoBeneficio = 'Salário Maternidade Rural';
    emojiBeneficio = '🌾';
  } else if (classificacao.includes('DPP') && classificacao.includes('135')) {
    tipoBeneficio = 'Salário Maternidade (DPP + Art. 135)';
    emojiBeneficio = '📋';
  } else if (classificacao.includes('DPP')) {
    tipoBeneficio = 'Salário Maternidade pós-demissão';
    emojiBeneficio = '💼';
  } else if (classificacao.includes('135')) {
    tipoBeneficio = 'Salário Maternidade (Art. 135)';
    emojiBeneficio = '📋';
  } else if (classificacao.includes('MEI')) {
    tipoBeneficio = 'Salário Maternidade MEI';
    emojiBeneficio = '🏪';
  } else {
    tipoBeneficio = 'Salário Maternidade';
    emojiBeneficio = '👶';
  }

  const perfil = (params.perfil || '').toLowerCase();
  let saudacaoPerfil = '';
  if (perfil.includes('gestante') && (perfil.includes('1º') || perfil.includes('primeiro'))) {
    saudacaoPerfil = 'Parabéns pela gestação do seu primeiro filho! 🎉 Que fase especial!';
  } else if (perfil.includes('gestante')) {
    saudacaoPerfil = 'Parabéns pela gestação! 🎉 Que momento lindo!';
  } else if (perfil.includes('mãe')) {
    saudacaoPerfil = 'Que bom que está buscando seus direitos como mãe! 💪';
  }

  const situacao = (params.situacao || '').toLowerCase();
  let infoSituacao = '';
  if (situacao.includes('rural')) {
    infoSituacao = '🌾 Como trabalhadora rural, você tem direitos específicos que muitas pessoas desconhecem — e nós somos especialistas nisso!';
  } else if (situacao.includes('desempregada') && situacao.includes('registro')) {
    infoSituacao = '💼 Mesmo estando desempregada, como você já teve registro em carteira, pode ter direito ao benefício. Vamos verificar juntas!';
  } else if (situacao.includes('desempregada')) {
    infoSituacao = '💼 Mesmo desempregada, você pode ter direito ao benefício. Não se preocupe, vamos analisar!';
  } else if (situacao.includes('mei') || situacao.includes('microempreendedora')) {
    infoSituacao = '🏪 Como MEI, você contribui para o INSS e pode ter direito ao benefício. Muitas MEIs não sabem disso!';
  } else if (situacao.includes('empregada') && situacao.includes('registro')) {
    infoSituacao = '✅ Com registro em carteira, seus direitos são ainda mais garantidos!';
  }

  let infoFilhos = '';
  if (params.filhos && params.filhos.toLowerCase() === 'sim') {
    infoFilhos = '\n\n👶 Vi que você tem filho(s) menor(es) de 5 anos — ótimo, o prazo para solicitar ainda está dentro do limite!';
  }

  let infoDiagnostico = '';
  const diagnostico = (params.diagnostico || '').toLowerCase();
  if (diagnostico && !diagnostico.includes('não tem') && !diagnostico.includes('nao tem') && diagnostico !== '*') {
    infoDiagnostico = `\n\n🏥 Vi que seu filho possui *${params.diagnostico}*. Saiba que isso pode garantir direitos adicionais importantes, e vamos cuidar disso com toda atenção.`;
  }

  let infoSeguro = '';
  if (params.seguro_desemprego && params.seguro_desemprego.toLowerCase() === 'sim') {
    infoSeguro = '\n\n📌 Você recebeu seguro desemprego — fique tranquila, isso *não impede* o salário maternidade!';
  }

  let infoDemissao = '';
  const demissao = (params.apos_demissao || '').toLowerCase();
  if (demissao.includes('menos de 1 ano')) {
    infoDemissao = '\n\n⏰ Como faz menos de 1 ano da demissão, suas chances são ainda melhores!';
  }

  let msg = `Olá ${primeiroNomeFormatado}! 👋\n`;
  msg += `Sou o *Marcus da Start Prev Assessoria*.\n\n`;

  if (saudacaoPerfil) {
    msg += `${saudacaoPerfil}\n\n`;
  }

  msg += `Já analisei as informações que você enviou e tenho boas notícias:\n\n`;
  msg += `${emojiBeneficio} *Benefício identificado:* ${tipoBeneficio}\n`;

  if (infoSituacao) msg += `\n${infoSituacao}`;
  if (infoFilhos) msg += infoFilhos;
  if (infoDiagnostico) msg += infoDiagnostico;
  if (infoSeguro) msg += infoSeguro;
  if (infoDemissao) msg += infoDemissao;

  msg += `\n\n✅ *Próximos passos:*\nVou analisar seu caso com mais detalhes. Enquanto isso, se tiver qualquer dúvida, é só mandar aqui que te respondo rapidinho!\n\n`;
  msg += `Estou aqui pra te ajudar em tudo! 😊`;

  return msg;
}

function formatarTexto(texto) {
  if (!texto) return '';
  let html = texto.replace(/\n/g, '<br />');
  html = html.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
  return html;
}

function formatarHora() {
  const agora = new Date();
  return agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatPage() {
  const router = useRouter();
  const [mensagens, setMensagens] = useState([]);
  const [inputTexto, setInputTexto] = useState('');
  const [digitando, setDigitando] = useState(false);
  const [sessionId] = useState(() => Date.now() + '-' + Math.random().toString(36).substr(2, 9));
  const [carregado, setCarregado] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagens, digitando]);

  useEffect(() => {
    setCarregado(true);

    if (!router.isReady) return;

    const timer1 = setTimeout(() => {
      setDigitando(true);
    }, 1000);

    const timer2 = setTimeout(() => {
      setDigitando(false);
      const mensagemInicial = gerarMensagemInicial(router.query);
      setMensagens([{
        texto: mensagemInicial,
        remetente: 'equipe',
        hora: formatarHora()
      }]);
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [router.isReady, router.query]);

  const enviarMensagem = async () => {
    if (!inputTexto.trim()) return;

    const textoEnviado = inputTexto.trim();

    setMensagens(prev => [...prev, {
      texto: textoEnviado,
      remetente: 'cliente',
      hora: formatarHora()
    }]);
    setInputTexto('');

    setDigitando(true);

    setTimeout(() => {
      setDigitando(false);
      setMensagens(prev => [...prev, {
        texto: 'Recebemos sua mensagem! Nossa equipe está analisando e já te responde aqui. ⏳',
        remetente: 'equipe',
        hora: formatarHora()
      }]);
    }, 2000);

    try {
      await fetch('/api/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'mensagem_chat',
          session_id: sessionId,
          nome: router.query.nome || '',
          celular: router.query.celular || '',
          classificacao: router.query.classificacao || '',
          mensagem: textoEnviado,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  const nomeCliente = router.query.nome || 'Cliente';

  return (
    <div className={`chat-container ${carregado ? 'loaded' : ''}`}>
      <header className="chat-header">
        <div className="header-content">
          <div className="logo-container">
            <img src="/logo-start-prev.png" alt="Start Prev" className="logo" />
          </div>
          <div className="cliente-nome">{nomeCliente}</div>
          <div className="status-online">
            <span className="status-dot"></span>
            <span className="status-text">Online</span>
          </div>
        </div>
        <div className="header-accent"></div>
      </header>

      <main className="messages-area">
        {mensagens.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.remetente}`}>
            {msg.remetente === 'equipe' && (
              <div className="avatar">SP</div>
            )}
            <div className="message-content">
              {msg.remetente === 'equipe' && (
                <span className="sender-name">Marcus — Start Prev</span>
              )}
              <div className={`message-bubble ${msg.remetente}`}>
                <div dangerouslySetInnerHTML={{ __html: formatarTexto(msg.texto) }} />
              </div>
              <span className={`message-time ${msg.remetente}`}>{msg.hora}</span>
            </div>
          </div>
        ))}

        {digitando && (
          <div className="message-wrapper equipe">
            <div className="avatar">SP</div>
            <div className="message-content">
              <span className="sender-name">Marcus — Start Prev</span>
              <div className="typing-indicator">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      <footer className="input-area">
        <div className="input-wrapper">
          <input
            type="text"
            value={inputTexto}
            onChange={(e) => setInputTexto(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="message-input"
          />
          <button
            onClick={enviarMensagem}
            className={`send-button ${inputTexto.trim() ? 'active' : ''}`}
            disabled={!inputTexto.trim()}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
          </button>
        </div>
      </footer>

      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100%;
          background: #0f0f1a;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          opacity: 0;
          transition: opacity 500ms ease;
        }

        .chat-container.loaded {
          opacity: 1;
        }

        .chat-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: linear-gradient(135deg, #1a1a2e, #16213e);
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          height: 64px;
          box-sizing: border-box;
        }

        .logo-container {
          flex-shrink: 0;
        }

        .logo {
          height: 40px;
          width: auto;
          object-fit: contain;
        }

        .cliente-nome {
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          flex: 1;
          text-align: center;
          padding: 0 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .status-online {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .status-text {
          color: #10b981;
          font-size: 12px;
          font-weight: 500;
        }

        .header-accent {
          height: 3px;
          background: linear-gradient(90deg, #ff6b35, #ff8c42);
        }

        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          padding-top: 83px;
          padding-bottom: 80px;
          background: #0f0f1a;
        }

        .message-wrapper {
          display: flex;
          align-items: flex-start;
          margin-bottom: 16px;
          animation: messageIn 300ms ease-out;
        }

        .message-wrapper.cliente {
          flex-direction: row-reverse;
        }

        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #ff6b35;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
          margin-right: 10px;
        }

        .message-wrapper.cliente .avatar {
          margin-right: 0;
          margin-left: 10px;
        }

        .message-content {
          max-width: 80%;
          display: flex;
          flex-direction: column;
        }

        .message-wrapper.cliente .message-content {
          align-items: flex-end;
        }

        .sender-name {
          font-size: 12px;
          color: #888888;
          margin-bottom: 4px;
        }

        .message-bubble {
          padding: 12px 16px;
          line-height: 1.7;
          font-size: 14px;
          color: #ffffff;
        }

        .message-bubble.equipe {
          background: #1e1e3a;
          border-radius: 16px 16px 16px 4px;
        }

        .message-bubble.cliente {
          background: #ff6b35;
          border-radius: 16px 16px 4px 16px;
        }

        .message-time {
          font-size: 11px;
          margin-top: 4px;
        }

        .message-time.equipe {
          color: #555555;
        }

        .message-time.cliente {
          color: rgba(255, 255, 255, 0.67);
        }

        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 12px 16px;
          background: #1e1e3a;
          border-radius: 16px 16px 16px 4px;
        }

        .typing-dot {
          width: 8px;
          height: 8px;
          background: #ff6b35;
          border-radius: 50%;
          animation: bounce 1.4s infinite;
        }

        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        .input-area {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: #1a1a2e;
          border-top: 1px solid rgba(255, 255, 255, 0.063);
          padding: 12px 16px;
          z-index: 100;
        }

        .input-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .message-input {
          flex: 1;
          background: #0f0f1a;
          border: 1px solid rgba(255, 255, 255, 0.082);
          border-radius: 24px;
          padding: 12px 20px;
          color: #ffffff;
          font-size: 14px;
          outline: none;
          transition: border-color 200ms;
        }

        .message-input::placeholder {
          color: #555555;
        }

        .message-input:focus {
          border-color: #ff6b35;
        }

        .send-button {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #ff6b35;
          border: none;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0.4;
          transition: transform 150ms, opacity 200ms;
          flex-shrink: 0;
        }

        .send-button.active {
          opacity: 1;
        }

        .send-button.active:hover {
          transform: scale(1.05);
        }

        .send-button.active:active {
          transform: scale(0.95);
        }

        .send-button:disabled {
          cursor: not-allowed;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes bounce {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-6px);
          }
        }

        @keyframes messageIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (min-width: 768px) {
          .chat-container {
            max-width: 480px;
            margin: 0 auto;
            box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
          }

          .chat-header {
            max-width: 480px;
            left: 50%;
            transform: translateX(-50%);
          }

          .input-area {
            max-width: 480px;
            left: 50%;
            transform: translateX(-50%);
          }
        }
      `}</style>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          height: 100%;
          background: #050510;
        }

        body {
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
