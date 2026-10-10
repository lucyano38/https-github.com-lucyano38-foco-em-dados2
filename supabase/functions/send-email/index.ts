import { createClient } from "npm:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

type Template = "welcome" | "trial_reminder" | "upsell" | "churn_recovery" | "report_ready" | "password_reset" | "affiliate_commission";

interface EmailRequest {
  user_id: string;
  template: Template;
  variables: Record<string, string>;
  email_sequence_id?: string;
}

const templateMessages: Record<Template, string> = {
  welcome: "Olá {{name}}, bem-vindo ao VarejoBI! Seu dashboard está pronto.",
  trial_reminder: "Olá {{name}}, seu trial termina em {{days}} dias. Aproveite!",
  upsell: "{{name}}, você já usou {{percent}}% do seu plano. Faça upgrade!",
  churn_recovery: "{{name}}, sentimos sua falta! Aqui vai um cupom de 30% OFF: {{coupon}}",
  report_ready: "{{name}}, seu relatório {{report_name}} está pronto!",
  password_reset: "Clique aqui para redefinir sua senha: {{reset_link}}",
  affiliate_commission: "{{name}}, você recebeu R${{amount}} em comissões!",
};

const templateCtas: Record<Template, { label: string; url: string } | null> = {
  welcome: { label: "Acessar Dashboard", url: "{{dashboard_url}}" },
  trial_reminder: { label: "Fazer Upgrade", url: "{{upgrade_url}}" },
  upsell: { label: "Ver Planos", url: "{{plans_url}}" },
  churn_recovery: { label: "Reativar Assinatura", url: "{{reactivate_url}}" },
  report_ready: { label: "Ver Relatório", url: "{{report_url}}" },
  password_reset: { label: "Redefinir Senha", url: "{{reset_link}}" },
  affiliate_commission: null,
};

function fillVariables(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? "");
}

const DASHBOARD_URL = Deno.env.get("PUBLIC_DASHBOARD_URL") ?? "https://app.varejobi.com.br";
const UNSUBSCRIBE_URL = Deno.env.get("PUBLIC_UNSUBSCRIBE_URL") ?? "https://app.varejobi.com.br/unsubscribe";

function buildHtmlTemplate(
  headerText: string,
  bodyHtml: string,
  cta: { label: string; url: string } | null,
  unsubscribeLink: string,
): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VarejoBI</title>
</head>
<body style="margin:0;padding:0;background-color:#0b1326;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b1326;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" style="max-width:600px;">
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#2563eb);border-radius:12px 12px 0 0;padding:24px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">VarejoBI</h1>
            </td>
          </tr>
          <tr>
            <td style="background-color:#111827;padding:32px;border-radius:0 0 12px 12px;">
              <h2 style="margin:0 0 16px 0;color:#f3f4f6;font-size:20px;font-weight:600;">${headerText}</h2>
              <div style="color:#d1d5db;font-size:16px;line-height:1.6;">
                ${bodyHtml}
              </div>
              ${cta ? `<div style="margin-top:24px;text-align:center;"><a href="${cta.url}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#ffffff;text-decoration:none;border-radius:8px;font-size:16px;font-weight:600;">${cta.label}</a></div>` : ""}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;text-align:center;">
              <p style="margin:0 0 8px 0;color:#6b7280;font-size:13px;">&copy; 2026 VarejoBI LTDA. Todos os direitos reservados.</p>
              <a href="${DASHBOARD_URL}" style="color:#6b7280;font-size:13px;text-decoration:underline;">Dashboard</a>
              <span style="color:#4b5563;margin:0 8px;">&middot;</span>
              <a href="${unsubscribeLink}" style="color:#6b7280;font-size:13px;text-decoration:underline;">Cancelar inscri&ccedil;&atilde;o</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

function buildTemplate(template: Template, vars: Record<string, string>): { subject: string; html: string } {
  const message = fillVariables(templateMessages[template], vars);
  const cta = templateCtas[template];
  const resolvedCta = cta ? { label: cta.label, url: fillVariables(cta.url, vars) } : null;
  const unsubscribeLink = fillVariables(UNSUBSCRIBE_URL, vars);

  const subjects: Record<Template, string> = {
    welcome: "Bem-vindo ao VarejoBI!",
    trial_reminder: "Seu trial est&aacute; terminando",
    upsell: "Que tal fazer um upgrade?",
    churn_recovery: "Volte para o VarejoBI com 30% OFF",
    report_ready: "Seu relat&oacute;rio est&aacute; pronto!",
    password_reset: "Redefini&ccedil;&atilde;o de senha",
    affiliate_commission: "Voc&ecirc; recebeu uma comiss&atilde;o!",
  };

  const headers: Record<Template, string> = {
    welcome: "Bem-vindo ao VarejoBI!",
    trial_reminder: "Trial pr&oacute;ximo do fim",
    upsell: "Aproveite ao m&aacute;ximo",
    churn_recovery: "Sentimos sua falta!",
    report_ready: "Relat&oacute;rio dispon&iacute;vel",
    password_reset: "Redefini&ccedil;&atilde;o de senha",
    affiliate_commission: "Nova comiss&atilde;o recebida",
  };

  const html = buildHtmlTemplate(headers[template], `<p style="margin:0;">${message}</p>`, resolvedCta, unsubscribeLink);

  return { subject: subjects[template], html };
}

async function sendEmailViaResend(to: string, subject: string, html: string): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "VarejoBI <noreply@varejobi.com.br>",
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }
}

async function createNotification(supabase: ReturnType<typeof createClient>, userId: string, template: Template) {
  const templateNames: Record<Template, string> = {
    welcome: "boas-vindas",
    trial_reminder: "lembrete de trial",
    upsell: "upsell",
    churn_recovery: "recuperação",
    report_ready: "relatório pronto",
    password_reset: "redefinição de senha",
    affiliate_commission: "comissão de afiliado",
  };

  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    title: `E-mail enviado: ${templateNames[template]}`,
    read: false,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Failed to create notification:", error.message);
  }
}

async function updateEmailSequence(supabase: ReturnType<typeof createClient>, sequenceId: string) {
  const { error } = await supabase
    .from("email_sequences")
    .update({ sent_at: new Date().toISOString() })
    .eq("id", sequenceId);

  if (error) {
    console.error("Failed to update email_sequence:", error.message);
  }
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ status: "error", error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!RESEND_API_KEY || RESEND_API_KEY === "placeholder" || RESEND_API_KEY.startsWith("re_") === false) {
      console.log("RESEND_API_KEY is missing or invalid, skipping email send");
      return new Response(JSON.stringify({ status: "skipped" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { user_id, template, variables, email_sequence_id }: EmailRequest = await req.json();

    if (!user_id || !template || !variables) {
      return new Response(JSON.stringify({ status: "error", error: "Missing required fields: user_id, template, variables" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const validTemplates: Template[] = [
      "welcome", "trial_reminder", "upsell", "churn_recovery",
      "report_ready", "password_reset", "affiliate_commission",
    ];

    if (!validTemplates.includes(template)) {
      return new Response(JSON.stringify({ status: "error", error: `Invalid template: ${template}` }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("email")
      .eq("id", user_id)
      .single();

    if (userError || !userData) {
      throw new Error(`User not found: ${userError?.message ?? "no data"}`);
    }

    const { subject, html } = buildTemplate(template, variables);

    await sendEmailViaResend(userData.email, subject, html);

    console.log(`Email sent: template=${template}, to=${userData.email}`);

    if (email_sequence_id) {
      await updateEmailSequence(supabase, email_sequence_id);
    }

    await createNotification(supabase, user_id, template);

    return new Response(JSON.stringify({ status: "sent", to: userData.email, template }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("send-email error:", message);
    return new Response(JSON.stringify({ status: "error", error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
