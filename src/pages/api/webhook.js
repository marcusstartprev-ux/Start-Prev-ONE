export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = req.body;

    // Log para debug (vai aparecer nos logs da Vercel)
    console.log('Mensagem recebida:', JSON.stringify(data, null, 2));

    // Aqui você pode integrar com o Bitrix24 ou outro sistema
    // Por enquanto, apenas retorna sucesso
    // TODO: Adicionar integração com Bitrix24 webhook

    return res.status(200).json({
      success: true,
      message: 'Mensagem recebida com sucesso',
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
