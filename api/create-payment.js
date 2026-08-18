// Crea una "Preferencia" de pago en MercadoPago con el monto exacto de cada
// plan, para que el cliente pague sin tener que escribir nada. El Access
// Token nunca se expone al navegador: esta función corre en el servidor
// (Vercel) y solo devuelve la URL de checkout ya lista.

const PLAN_PRICES = {
  esencial: { title: 'BaseCode - Plan Esencial (Adelanto 40%)', amount: 600 },
  avanzado: { title: 'BaseCode - Plan Avanzado (Adelanto 40%)', amount: 720 },
  mensual: { title: 'BaseCode - Mantenimiento Mensual', amount: 150 },
  semestral: { title: 'BaseCode - Mantenimiento Semestral', amount: 720 },
  anual: { title: 'BaseCode - Mantenimiento Anual', amount: 1200 },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    res.status(500).json({ error: 'El pago con tarjeta todavía no está configurado.' });
    return;
  }

  const { planKey } = req.body || {};
  const plan = PLAN_PRICES[planKey];
  if (!plan) {
    res.status(400).json({ error: 'Plan no válido.' });
    return;
  }

  try {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            title: plan.title,
            quantity: 1,
            unit_price: plan.amount,
            currency_id: 'PEN',
          },
        ],
        back_urls: {
          success: 'https://www.basecodepe.tech/?pago=exitoso',
          failure: 'https://www.basecodepe.tech/?pago=fallido',
          pending: 'https://www.basecodepe.tech/?pago=pendiente',
        },
        auto_return: 'approved',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json({ error: data?.message || 'No se pudo generar el link de pago.' });
      return;
    }

    res.status(200).json({ checkoutUrl: data.init_point });
  } catch (err) {
    res.status(500).json({ error: 'Error de conexión con MercadoPago.' });
  }
}
