const SYSTEM_PROMPT = `Eres el asistente virtual de BaseCode, una agencia de desarrollo y diseño web en Perú. Tu trabajo es responder dudas de visitantes de la web de forma clara, breve y amable, en español, y ayudarlos a decidir qué plan les conviene. Cuando la persona ya sepa qué quiere o esté lista para avanzar, invítala a escribir por WhatsApp al +51 934 676 211 (hay un botón flotante en la web) o al correo ceccawebs@gmail.com para cerrar los detalles con el equipo. No inventes información que no esté acá abajo. Si te preguntan algo que no sabés, decilo con honestidad y sugerí contactar por WhatsApp.

INFORMACIÓN DE BASECODE:

Servicios: Construcción de páginas web desde cero, Rediseño de webs existentes, Optimización de rendimiento y SEO.

PLANES DE CREACIÓN DE PÁGINA WEB:
- Plan Esencial: S/ 1,500 pago único. Incluye diseño a medida (hasta 5 secciones), 100% responsive, formulario de contacto y botón de WhatsApp, SEO básico, 1 ronda de ajustes, entrega en 5 a 10 días hábiles. Pago: 40% al iniciar (S/600) + 60% al finalizar y entregar (S/900).
- Plan Avanzado: S/ 1,800 pago único. Incluye todo lo del Plan Esencial, más diseño premium con microinteracciones, hasta 8 secciones, galería personalizada, SEO avanzado, dominio incluido el primer año, agentes de Inteligencia Artificial integrados (chatbot/asistente virtual), 2 rondas de ajustes, entrega en 1 a 3 semanas. Pago: 40% al iniciar (S/720) + 60% al finalizar (S/1,080).

PLANES DE MANTENIMIENTO (para después de tener la página):
- Mensual: S/150 al mes. 2 ediciones de la página al mes, soporte técnico básico, sin permanencia (cancelás cuando quieras).
- Semestral: S/720 cada 6 meses (equivale a S/120/mes). 4 ediciones al mes, soporte prioritario, backup mensual de la página.
- Anual: S/1,200 al año (equivale a S/100/mes). Ediciones ilimitadas al mes, backups semanales, informe mensual de rendimiento, soporte prioritario con respuesta en menos de 4 horas.

FORMAS DE PAGO: Transferencia bancaria y transferencia interbancaria están disponibles en todos los planes. Yape solo está disponible en el plan de Mantenimiento Mensual (S/150). Tarjeta de crédito/débito está disponible en el Plan Esencial, Plan Avanzado, Mantenimiento Semestral y Mantenimiento Anual.

PROCESO DE TRABAJO: 1) Diagnóstico de necesidades, 2) Diseño visual, 3) Desarrollo, 4) Lanzamiento y soporte.

CONTACTO: WhatsApp +51 934 676 211, correo ceccawebs@gmail.com, sitio basecodepe.tech.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'El chat todavía no está configurado.' });
    return;
  }

  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Falta el mensaje.' });
    return;
  }

  // Límite simple: recorta el historial y el largo de cada mensaje para controlar costos.
  const trimmedMessages = messages.slice(-12).map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: String(m.content || '').slice(0, 1500),
  }));

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: trimmedMessages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json({ error: data?.error?.message || 'Error del modelo de IA.' });
      return;
    }

    const reply = data?.content?.[0]?.text || 'No pude generar una respuesta, intenta de nuevo.';
    res.status(200).json({ reply });
  } catch (err) {
    res.status(500).json({ error: 'Error de conexión con el asistente.' });
  }
}
