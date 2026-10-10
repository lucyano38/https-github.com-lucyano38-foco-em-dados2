import { createClient } from "npm:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const DASHBOARD_URL = Deno.env.get("PUBLIC_DASHBOARD_URL") ?? "https://app.varejobi.com.br";

const log = (...args: unknown[]) => console.log("[scheduled-reports]", ...args);
const logError = (...args: unknown[]) => console.error("[scheduled-reports]", ...args);

interface ScheduledReport {
  id: string;
  user_id: string;
  dashboard_id: string;
  recipients: string[];
  frequency: "daily" | "weekly" | "monthly";
  config: Record<string, unknown>;
  next_send_at: string;
  is_active: boolean;
  last_sent_at: string | null;
}

function calculateNextSend(frequency: "daily" | "weekly" | "monthly"): string {
  const now = new Date();
  // Set to 6h BRT (UTC-3 = 9h UTC)
  const next = new Date(now);

  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
  }

  next.setUTCHours(9, 0, 0, 0); // 6h BRT = 9h UTC
  return next.toISOString();
}

function computeMetrics(rows: Record<string, unknown>[]): { label: string; value: string }[] {
  const numericCols: string[] = [];
  const colValues = new Map<string, number[]>();

  for (const row of rows) {
    for (const [key, val] of Object.entries(row)) {
      const num = typeof val === "number" ? val : Number(val);
      if (!isNaN(num)) {
        if (!colValues.has(key)) {
          colValues.set(key, []);
          numericCols.push(key);
        }
        colValues.get(key)!.push(num);
      }
    }
  }

  // Limit to at most 6 metrics to avoid overwhelming the email
  const colsToShow = numericCols.slice(0, 6);
  const metrics: { label: string; value: string }[] = [];

  for (const col of colsToShow) {
    const values = colValues.get(col)!;
    const total = values.reduce((a, b) => a + b, 0);
    const avg = total / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    metrics.push({ label: `Total ${col}`, value: formatNumber(total) });
    metrics.push({ label: `Média ${col}`, value: formatNumber(avg) });
    metrics.push({ label: `Mín ${col}`, value: formatNumber(min) });
    metrics.push({ label: `Máx ${col}`, value: formatNumber(max) });
  }

  return metrics;
}

function formatNumber(n: number): string {
  if (Number.isInteger(n)) return n.toLocaleString("pt-BR");
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function buildHtmlEmail(
  metrics: { label: string; value: string }[],
  dashboardId: string,
  emails: string[],
  frequency: string,
): string {
  const metricCards = metrics
    .map(
      (m) => `
      <tr>
        <td style="padding:12px 16px;background-color:#1f2937;border-radius:8px;margin-bottom:8px;display:block;">
          <div style="color:#9ca3af;font-size:13px;margin-bottom:4px;">${m.label}</div>
          <div style="color:#f3f4f6;font-size:20px;font-weight:700;">${m.value}</div>
        </td>
      </tr>`,
    )
    .join("");

  const dashboardLink = `${DASHBOARD_URL}/dashboard/${dashboardId}`;
  const recipientsText = emails.join(", ");

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório VarejoBI</title>
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
              <h2 style="margin:0 0 8px 0;color:#f3f4f6;font-size:20px;font-weight:600;">Relatório ${frequency === "daily" ? "Diário" : frequency === "weekly" ? "Semanal" : "Mensal"}</h2>
              <p style="margin:0 0 24px 0;color:#6b7280;font-size:14px;">Resumo das métricas do seu dashboard.</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${metricCards}
              </table>

              <div style="margin-top:24px;text-align:center;">
                <a href="${dashboardLink}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#ffffff;text-decoration:none;border-radius:8px;font-size:16px;font-weight:600;">Ver Dashboard</a>
              </div>

              <p style="margin:24px 0 0 0;color:#4b5563;font-size:12px;text-align:center;">
                Relatório enviado para: ${recipientsText}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;text-align:center;">
              <p style="margin:0 0 8px 0;color:#6b7280;font-size:13px;">&copy; 2026 VarejoBI LTDA. Todos os direitos reservados.</p>
              <a href="${DASHBOARD_URL}" style="color:#6b7280;font-size:13px;text-decoration:underline;">Dashboard</a>
              <span style="color:#4b5563;margin:0 8px;">&middot;</span>
              <a href="${DASHBOARD_URL}/unsubscribe" style="color:#6b7280;font-size:13px;text-decoration:underline;">Cancelar inscrição</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

async function sendEmailViaResend(
  to: string[],
  subject: string,
  html: string,
): Promise<void> {
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

Deno.serve(async (_req: Request) => {
  try {
    if (!RESEND_API_KEY || RESEND_API_KEY === "placeholder" || !RESEND_API_KEY.startsWith("re_")) {
      log("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ status: "email_not_configured" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if scheduled_reports table exists
    const { error: tableCheckError } = await supabase
      .from("scheduled_reports")
      .select("id", { head: true, count: "exact" })
      .limit(1);

    if (tableCheckError && tableCheckError.message?.includes("relation") && tableCheckError.message?.includes("does not exist")) {
      log("Table scheduled_reports does not exist yet");
      return new Response(JSON.stringify({ status: "no_table" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (tableCheckError) {
      logError("Error checking scheduled_reports table:", tableCheckError.message);
      return new Response(JSON.stringify({ status: "error", error: tableCheckError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch reports due for sending
    const { data: reports, error: reportsError } = await supabase
      .from("scheduled_reports")
      .select("*")
      .eq("is_active", true)
      .lte("next_send_at", new Date().toISOString());

    if (reportsError) {
      logError("Error fetching scheduled reports:", reportsError.message);
      return new Response(JSON.stringify({ status: "error", error: reportsError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const reportList = (reports ?? []) as unknown as ScheduledReport[];
    log(`Found ${reportList.length} report(s) to send`);

    let sentCount = 0;

    for (const report of reportList) {
      try {
        log(`Processing report ${report.id} for dashboard ${report.dashboard_id}`);

        // Fetch dashboard config
        const { data: dashboard, error: dashError } = await supabase
          .from("dashboards")
          .select("config_json")
          .eq("id", report.dashboard_id)
          .single();

        if (dashError || !dashboard) {
          logError(`Dashboard ${report.dashboard_id} not found for report ${report.id}`, dashError);
          continue;
        }

        // Fetch data uploads for this user
        const { data: uploads, error: uploadsError } = await supabase
          .from("data_uploads")
          .select("processed_data")
          .eq("user_id", report.user_id)
          .not("processed_data", "is", null)
          .order("created_at", { ascending: false })
          .limit(1);

        let metrics: { label: string; value: string }[] = [];

        if (uploadsError) {
          logError(`Error fetching uploads for report ${report.id}:`, uploadsError.message);
        } else if (uploads && uploads.length > 0) {
          const rows = (uploads[0].processed_data as Record<string, unknown>[]) ?? [];
          if (rows.length > 0) {
            metrics = computeMetrics(rows);
          }
        }

        if (metrics.length === 0) {
          metrics.push({ label: "Dashboard", value: "Sem dados numéricos disponíveis" });
        }

        const recipients: string[] = report.recipients;
        if (!recipients || recipients.length === 0) {
          logError(`Report ${report.id} has no recipients`);
          continue;
        }

        const frequencyLabel = report.frequency === "daily" ? "Diário" : report.frequency === "weekly" ? "Semanal" : "Mensal";
        const subject = `Relatório ${frequencyLabel} VarejoBI - ${new Date().toLocaleDateString("pt-BR")}`;
        const html = buildHtmlEmail(metrics, report.dashboard_id, recipients, report.frequency);

        await sendEmailViaResend(recipients, subject, html);
        log(`Email sent for report ${report.id} to ${recipients.join(", ")}`);

        // Update last_sent_at and next_send_at
        const now = new Date().toISOString();
        const nextSend = calculateNextSend(report.frequency);

        const { error: updateError } = await supabase
          .from("scheduled_reports")
          .update({
            last_sent_at: now,
            next_send_at: nextSend,
          })
          .eq("id", report.id);

        if (updateError) {
          logError(`Failed to update next_send_at for report ${report.id}:`, updateError.message);
        } else {
          log(`Updated report ${report.id}: last_sent_at=${now}, next_send_at=${nextSend}`);
        }

        // Create notification
        const { error: notifError } = await supabase.from("notifications").insert({
          user_id: report.user_id,
          title: `Relatório enviado para ${recipients.join(", ")}!`,
          read: false,
          created_at: new Date().toISOString(),
        });

        if (notifError) {
          logError(`Failed to create notification for report ${report.id}:`, notifError.message);
        }

        sentCount++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        logError(`Error processing report ${report.id}:`, msg);
      }
    }

    log(`Completed: ${sentCount} report(s) sent`);
    return new Response(JSON.stringify({ status: "completed", reports_sent: sentCount }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    logError("Fatal error:", msg);
    return new Response(JSON.stringify({ status: "error", error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
