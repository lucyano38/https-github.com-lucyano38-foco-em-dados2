import { supabaseAdmin, getCorsHeaders } from "../_shared/supabase-admin.ts";

const CHURN_ACTIONS: Record<string, { title: string; discount?: string }> = {
  inactivity_7d: { title: "7 dias sem login", discount: "10%" },
  inactivity_14d: { title: "14 dias sem login", discount: "25%" },
  trial_expiring: { title: "Trial expirando", discount: "30%" },
  chatbot_abandoned: { title: "Chatbot abandonado", discount: "15%" },
  upload_stopped: { title: "Parou de fazer upload", discount: "20%" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders(req.headers.get("origin")) });
  }

  try {
    const body = await req.json();
    const event = body.event || body.eventType;
    const userId = body.userId || body.user_id;
    if (!event || !userId) throw new Error("event e userId são obrigatórios.");

    const action = CHURN_ACTIONS[event];
    if (!action) throw new Error(`Evento desconhecido: ${event}`);

    const suggestion = action.discount
      ? `Oferecer cupom de ${action.discount} de desconto para reativar o usuário.`
      : `Enviar e-mail de reengajamento para o usuário.`;

    await supabaseAdmin.from("notifications").insert({
      user_id: userId,
      type: "churn_alert",
      title: `Risco de Churn: ${action.title}`,
      message: suggestion,
      channel: "in_app",
      metadata: { event, discount: action.discount },
    });

    return new Response(JSON.stringify({ suggestion, discount: action.discount }), {
      status: 200,
      headers: { ...getCorsHeaders(req.headers.get("origin")), "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...getCorsHeaders(req.headers.get("origin")), "Content-Type": "application/json" },
    });
  }
});
