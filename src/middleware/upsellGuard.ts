import { Request, Response, NextFunction } from 'express';
import { checkPlanLimit, PlanTier, getPlanConfig } from '../config/plans';

export interface UpsellRequest extends Request {
  user?: {
    uid: string;
    email: string;
    role: string;
    plan: PlanTier;
  };
}

export function upsellGuard(metric: 'lines_consumed' | 'dashboards_created' | 'marketplaces_connected') {
  return (req: UpsellRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const plan = getPlanConfig(user.plan);
    const currentValue = parseInt(req.headers['x-current-usage'] as string || '0', 10);
    
    const result = checkPlanLimit(user.plan, metric, currentValue);

    if (!result.allowed) {
      const nextPlan = result.upsellTo ? getPlanConfig(result.upsellTo) : null;
      return res.status(403).json({
        error: 'LIMIT_REACHED',
        message: `Você atingiu o limite de ${metric === 'lines_consumed' ? 'linhas' : metric === 'dashboards_created' ? 'dashboards' : 'marketplaces'} do seu plano.`,
        limit: result.limit,
        currentValue,
        upsell: nextPlan ? {
          tier: nextPlan.tier,
          label: nextPlan.label,
          price: nextPlan.price,
          maxLines: nextPlan.maxLines,
        } : null,
      });
    }

    next();
  };
}
