import { PlanTier, getPlanConfig } from '../config/plans';

export interface UpsellWarningEvent {
  userId: string;
  userEmail: string;
  currentTier: PlanTier;
  suggestedTier: PlanTier;
  metric: string;
  currentValue: number;
  limit: number;
  timestamp: Date;
}

export function createUpsellWarning(data: UpsellWarningEvent): void {
  const current = getPlanConfig(data.currentTier);
  const suggested = getPlanConfig(data.suggestedTier);

  console.log(`[UPSELL_WARNING] User ${data.userEmail} (${data.currentTier}) hit limit ${data.metric}: ${data.currentValue}/${data.limit}. Suggesting ${data.suggestedTier} (R$${suggested.price}/mês)`);

  try {
    if (typeof global !== 'undefined' && (global as any).__firestore) {
      const db = (global as any).__firestore;
      db.collection('upsell_events').add({
        userId: data.userId,
        userEmail: data.userEmail,
        currentTier: data.currentTier,
        suggestedTier: data.suggestedTier,
        metric: data.metric,
        currentValue: data.currentValue,
        limit: data.limit,
        createdAt: new Date(),
      });
    }
  } catch (err) {
    console.error('[UPSELL_WARNING] Failed to log event:', err);
  }

  // Also dispatch to Customer Success channel if configured
  const webhookUrl = process.env.CUSTOMER_SUCCESS_WEBHOOK;
  if (webhookUrl) {
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'upsell_warning',
        ...data,
      }),
    }).catch(err => console.error('[UPSELL_WARNING] Webhook dispatch failed:', err));
  }
}
