// URL do N8N - TESTE (para produção, trocar para /webhook/ sem -test)
const N8N_WEBHOOK_URL = 'https://startprev.app.n8n.cloud/webhook-test/form-startprev';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    // Log para debug (vai aparecer nos logs da Vercel)
    console.log('Mensagem recebida:', JSON.stringify(data, null, 2));

    // Repassar para o N8N
    let n8nResponse = null;
    try {
      const n8nRes = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      n8nResponse = await n8nRes.text();
      console.log('N8N Response:', n8nResponse);
    } catch (n8nErr) {
      console.error('Erro ao enviar para N8N:', n8nErr.message);
      // Não bloqueia o fluxo se N8N falhar
    }

    return res.status(200).json({
      success: true,
      message: 'Mensagem recebida com sucesso',
      n8n_forwarded: !!n8nResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro no webhook:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
}
