export default async function handler(req, res) { if (req.method !== 'POST') { return res.status(405).send('Método não permitido'); } try { const body = req.body; // Verifica se é evento de pagamento if (body.type === 'payment') { const paymentId = body.data.id; // 1. Consultar pagamento no Mercado Pago const mpResponse = await fetch( ` https://api.mercadopago.com/v1/payments/${paymentId}` , { headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`, }, } ); const paymentData = await mpResponse.json(); // 2. Verificar status if (paymentData.status === 'approved') {

  const orderId = paymentData.external_reference;

  const total = paymentData.transaction_amount;
  const fee = paymentData.marketplace_fee || 0;
  const supplierAmount = total - fee;

  console.log('Pagamento aprovado:', orderId);

  // ENVIA PARA GOOGLE SHEETS
  await fetch('https://script.google.com/macros/s/AKfycbx.../exec', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      pedido: orderId,
      total: total,
      comissao: fee,
      liquido: supplierAmount,
      status: 'PENDENTE'
    })
  });

} // 3. Disparar email await fetch(`${process.env.BASE_URL}/api/send-email`, { método: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ to: 'SEU_EMAIL_AQUI', subject: 'Pagamento dentro', html: `<h1>Pagamento.</h1><p>Pedido: ${orderId}</p>` }) }); } } return res.status(200).send('OK'); } catch (erro) { console.error (erro); return res.status(500).send('Erro interno'); } }
