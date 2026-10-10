import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17.6.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const PRICE_PLAN_MAP: Record<string, string> = {
  price_1TvIlVArgRpIlwse4B506NvH: "starter",
  price_1TvIldArgRpIlwsediloz86w: "starter",
  price_1TvIlXArgRpIlwseHP5NJ3qj: "pro",
  price_1TvIlfArgRpIlwsegtgpmFVI: "pro",
  price_1TvIlZArgRpIlwseq43UM2x4: "business",
  price_1TvIlhArgRpIlwseCWYLKFKd: "business",
  price_1TvIlbArgRpIlwsekq0bBeMD: "enterprise",
  price_1TvIljArgRpIlwsehUmXtMWJ: "enterprise",
};

async function findPlanIdByTier(tier: string): Promise<string | null> {
  const { data } = await supabase.from("plans").select("id").eq("tier", tier).maybeSingle();
  return data?.id || null;
}

async function findFreePlanId(): Promise<string | null> {
  const { data } = await supabase.from("plans").select("id").eq("tier", "free").maybeSingle();
  return data?.id || null;
}

async function isEventProcessed(eventId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from("processed_events")
      .select("id")
      .eq("event_id", eventId)
      .maybeSingle();
    return data !== null;
  } catch (err) {
    console.log(`[stripe-webhook] idempotency check failed (table may not exist): ${err.message}`);
    return false;
  }
}

async function markEventProcessed(eventId: string): Promise<void> {
  try {
    await supabase.from("processed_events").insert({ event_id: eventId });
  } catch (err) {
    console.log(`[stripe-webhook] failed to mark event processed: ${err.message}`);
  }
}

Deno.serve(async (req) => {
  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response("Missing stripe-signature header", { status: 400 });
    }

    const body = await req.text();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        Deno.env.get("STRIPE_WEBHOOK_SECRET")!
      );
    } catch (err) {
      console.log(`[stripe-webhook] signature verification failed: ${err.message}`);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const now = Math.floor(Date.now() / 1000);
    if (event.created && now - event.created > 300) {
      console.log(`[stripe-webhook] event too old: ${event.id}, created=${event.created}`);
      return new Response("Event too old", { status: 400 });
    }

    const alreadyProcessed = await isEventProcessed(event.id);
    if (alreadyProcessed) {
      console.log(`[stripe-webhook] event already processed: ${event.id}`);
      return new Response(JSON.stringify({ received: true, idempotent: true }), { status: 200 });
    }

    console.log(`[stripe-webhook] processing event: ${event.type} (${event.id})`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const subscriptionId = session.subscription as string;
        const stripeCustomerId = session.customer as string;
        const planTier = session.metadata?.plan_tier;

        if (!userId) {
          console.log("[stripe-webhook] checkout.session.completed missing client_reference_id");
          break;
        }

        if (!planTier) {
          console.log("[stripe-webhook] checkout.session.completed missing metadata.plan_tier");
          break;
        }

        const planId = await findPlanIdByTier(planTier);
        if (!planId) {
          console.log(`[stripe-webhook] no plan found for tier: ${planTier}`);
          break;
        }

        const { error: upsertError } = await supabase.from("subscriptions").upsert({
          user_id: userId,
          plan_id: planId,
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: stripeCustomerId,
          status: "active",
        });
        if (upsertError) {
          console.log(`[stripe-webhook] subscription upsert error: ${upsertError.message}`);
        }

        const { error: profileError } = await supabase
          .from("profiles")
          .update({ plan_id: planId, subscription_status: "active" })
          .eq("id", userId);
        if (profileError) {
          console.log(`[stripe-webhook] profile update error: ${profileError.message}`);
        }

        const { data: planData } = await supabase
          .from("plans")
          .select("name")
          .eq("id", planId)
          .maybeSingle();

        const planName = planData?.name || planTier;

        const { error: notifError } = await supabase.from("notifications").insert({
          user_id: userId,
          title: "Assinatura Ativada",
          message: `Bem-vindo ao plano ${planName}!`,
        });
        if (notifError) {
          console.log(`[stripe-webhook] notification insert error: ${notifError.message}`);
        }

        console.log(`[stripe-webhook] checkout.session.completed processed for user=${userId}, plan=${planTier}`);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) {
          console.log("[stripe-webhook] invoice.payment_succeeded missing subscription");
          break;
        }

        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("id, user_id")
          .eq("stripe_subscription_id", subscriptionId)
          .maybeSingle();

        if (!subscription) {
          console.log(`[stripe-webhook] no subscription found for stripe id: ${subscriptionId}`);
          break;
        }

        const amount = invoice.amount_paid || invoice.total || 0;

        const { error: paymentError } = await supabase.from("payments").insert({
          user_id: subscription.user_id,
          subscription_id: subscription.id,
          amount: amount / 100,
          status: "paid",
          gateway: "stripe",
          gateway_payment_id: invoice.id,
        });
        if (paymentError) {
          console.log(`[stripe-webhook] payment insert error: ${paymentError.message}`);
        }

        if (invoice.lines?.data?.[0]?.period?.end) {
          const periodEnd = new Date(invoice.lines.data[0].period.end * 1000).toISOString();
          const { error: updateError } = await supabase
            .from("subscriptions")
            .update({ current_period_end: periodEnd })
            .eq("id", subscription.id);
          if (updateError) {
            console.log(`[stripe-webhook] subscription period update error: ${updateError.message}`);
          }
        }

        if (invoice.billing_reason === "subscription_cycle") {
          const { data: affiliate } = await supabase
            .from("affiliates")
            .select("id, total_earned")
            .eq("user_id", subscription.user_id)
            .maybeSingle();

          if (affiliate) {
            const commissionAmount = amount / 100;
            const { error: commissionError } = await supabase
              .from("affiliates")
              .update({ total_earned: (affiliate.total_earned || 0) + commissionAmount })
              .eq("id", affiliate.id);
            if (commissionError) {
              console.log(`[stripe-webhook] affiliate commission error: ${commissionError.message}`);
            } else {
              console.log(`[stripe-webhook] affiliate commission added: ${commissionAmount} for user=${subscription.user_id}`);
            }
          }
        }

        console.log(`[stripe-webhook] invoice.payment_succeeded processed for subscription=${subscriptionId}`);
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const stripeSubId = sub.id;
        const status = sub.status;
        const currentPeriodStart = sub.current_period_start
          ? new Date(sub.current_period_start * 1000).toISOString()
          : null;
        const currentPeriodEnd = sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null;
        const cancelAtPeriodEnd = sub.cancel_at_period_end;

        const priceId = sub.items?.data?.[0]?.price?.id;
        let planId: string | null = null;
        if (priceId) {
          const tier = PRICE_PLAN_MAP[priceId];
          if (tier) {
            planId = await findPlanIdByTier(tier);
          } else {
            console.log(`[stripe-webhook] unknown price_id mapping: ${priceId}`);
          }
        }

        const updateData: Record<string, unknown> = {
          status,
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          cancel_at_period_end: cancelAtPeriodEnd,
        };
        if (planId) {
          updateData.plan_id = planId;
        }

        const { error: updateError } = await supabase
          .from("subscriptions")
          .update(updateData)
          .eq("stripe_subscription_id", stripeSubId);
        if (updateError) {
          console.log(`[stripe-webhook] subscription update error: ${updateError.message}`);
        }

        console.log(`[stripe-webhook] customer.subscription.updated processed for sub=${stripeSubId}, status=${status}`);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const stripeSubId = sub.id;

        const { data: deletedSub } = await supabase
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", stripeSubId)
          .maybeSingle();

        const { error: subUpdateError } = await supabase
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", stripeSubId);
        if (subUpdateError) {
          console.log(`[stripe-webhook] subscription cancel error: ${subUpdateError.message}`);
        }

        if (deletedSub?.user_id) {
          const freePlanId = await findFreePlanId();
          if (freePlanId) {
            const { error: profileUpdateError } = await supabase
              .from("profiles")
              .update({ plan_id: freePlanId, subscription_status: "inactive" })
              .eq("id", deletedSub.user_id);
            if (profileUpdateError) {
              console.log(`[stripe-webhook] profile update error: ${profileUpdateError.message}`);
            }
          }

          const { error: notifError } = await supabase.from("notifications").insert({
            user_id: deletedSub.user_id,
            title: "Assinatura Cancelada",
            message: "Sua assinatura foi cancelada",
          });
          if (notifError) {
            console.log(`[stripe-webhook] notification insert error: ${notifError.message}`);
          }

          const { error: emailError } = await supabase.from("email_sequences").insert({
            user_id: deletedSub.user_id,
            step: 1,
            sequence_type: "churn_recovery",
          });
          if (emailError) {
            console.log(`[stripe-webhook] email sequence insert error: ${emailError.message}`);
          }
        }

        console.log(`[stripe-webhook] customer.subscription.deleted processed for sub=${stripeSubId}`);
        break;
      }

      default:
        console.log(`[stripe-webhook] unhandled event type: ${event.type}`);
    }

    await markEventProcessed(event.id);

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.log(`[stripe-webhook] unexpected error: ${err.message}`);
    return new Response("Internal Server Error", { status: 500 });
  }
});
