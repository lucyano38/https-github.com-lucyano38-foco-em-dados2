export type PlanTier = 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';

export interface PlanConfig {
  tier: PlanTier;
  label: string;
  price: number;
  maxLines: number;
  maxDashboards: number;
  maxMarketplaces: number;
  features: string[];
}

export const PLAN_CONFIG: Record<PlanTier, PlanConfig> = {
  FREE: {
    tier: 'FREE',
    label: 'Grátis',
    price: 0,
    maxLines: 500,
    maxDashboards: 1,
    maxMarketplaces: 0,
    features: ['upload_csv', 'dashboard_basico', 'export_pdf'],
  },
  STARTER: {
    tier: 'STARTER',
    label: 'Starter',
    price: 97,
    maxLines: 2000,
    maxDashboards: 1,
    maxMarketplaces: 1,
    features: ['upload_csv', 'dashboard_basico', 'export_pdf', 'marketplace_1'],
  },
  PRO: {
    tier: 'PRO',
    label: 'Pro',
    price: 297,
    maxLines: 20000,
    maxDashboards: 3,
    maxMarketplaces: 3,
    features: [
      'upload_csv', 'dashboard_avancado', 'export_pdf', 'export_excel',
      'marketplace_3', 'insight_ia', 'churn_prediction', 'alerta_whatsapp',
    ],
  },
  BUSINESS: {
    tier: 'BUSINESS',
    label: 'Business',
    price: 597,
    maxLines: 100000,
    maxDashboards: 10,
    maxMarketplaces: 999,
    features: [
      'upload_csv', 'dashboard_avancado', 'export_pdf', 'export_excel',
      'marketplace_ilimitado', 'insight_ia', 'churn_prediction',
      'alerta_whatsapp', 'painel_parceiros', 'api_rest', 'gerente_dedicado',
    ],
  },
  ENTERPRISE: {
    tier: 'ENTERPRISE',
    label: 'Enterprise',
    price: 997,
    maxLines: 999999999,
    maxDashboards: 999,
    maxMarketplaces: 999,
    features: [
      'upload_csv', 'dashboard_avancado', 'export_pdf', 'export_excel',
      'marketplace_ilimitado', 'insight_ia', 'churn_prediction',
      'alerta_whatsapp', 'painel_parceiros', 'api_rest', 'gerente_dedicado',
      'onboarding_dedicado', 'sla_99_9', 'treinamento_equipe', 'suporte_24h',
    ],
  },
};

export function getPlanConfig(tier: PlanTier): PlanConfig {
  return PLAN_CONFIG[tier] || PLAN_CONFIG.FREE;
}

export function checkPlanLimit(
  tier: PlanTier,
  metric: 'lines_consumed' | 'dashboards_created' | 'marketplaces_connected',
  currentValue: number
): { allowed: boolean; limit: number; upsellTo?: PlanTier } {
  const plan = getPlanConfig(tier);
  let limit: number;

  switch (metric) {
    case 'lines_consumed':
      limit = plan.maxLines;
      break;
    case 'dashboards_created':
      limit = plan.maxDashboards;
      break;
    case 'marketplaces_connected':
      limit = plan.maxMarketplaces;
      break;
    default:
      limit = 0;
  }

  if (currentValue >= limit) {
    const upsellOrder: PlanTier[] = ['STARTER', 'PRO', 'BUSINESS', 'ENTERPRISE'];
    const currentIndex = upsellOrder.indexOf(tier);
    const nextTier = currentIndex >= 0 && currentIndex < upsellOrder.length - 1
      ? upsellOrder[currentIndex + 1]
      : undefined;
    return { allowed: false, limit, upsellTo: nextTier };
  }

  return { allowed: true, limit };
}
