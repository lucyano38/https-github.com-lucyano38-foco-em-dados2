CREATE OR REPLACE FUNCTION public.check_plan_limit(
  p_user_id UUID,
  p_feature TEXT,
  p_quantity INT DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan_id UUID;
  v_tier plan_tier;
  v_limit INT;
  v_used INT;
BEGIN
  SELECT plan_id, plan_tier INTO v_plan_id, v_tier
  FROM public.users WHERE id = p_user_id;

  IF v_tier = 'enterprise' THEN
    RETURN jsonb_build_object('allowed', true, 'tier', v_tier);
  END IF;

  SELECT
    CASE p_feature
      WHEN 'lines' THEN limits_rows
      WHEN 'dashboards' THEN limits_dashboards
      WHEN 'marketplaces' THEN limits_marketplaces
      WHEN 'chatbots' THEN limits_chatbots
      WHEN 'api_calls' THEN limits_api_calls
      WHEN 'storage_mb' THEN limits_storage_mb
    END
  INTO v_limit
  FROM public.plans WHERE id = v_plan_id;

  SELECT COALESCE(SUM(quantity), 0) INTO v_used
  FROM public.usage_logs
  WHERE user_id = p_user_id
    AND feature = p_feature
    AND date >= DATE_TRUNC('month', CURRENT_DATE);

  IF (v_used + p_quantity) > v_limit THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'tier', v_tier,
      'limit', v_limit,
      'used', v_used,
      'message', 'Limite excedido. Faça upgrade do seu plano.'
    );
  END IF;

  RETURN jsonb_build_object(
    'allowed', true,
    'tier', v_tier,
    'limit', v_limit,
    'used', v_used
  );
END;
$$;
