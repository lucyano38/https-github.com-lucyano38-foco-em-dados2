import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const SITE_URL = "https://focoemdados.com.br";

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());
    const { code, state, shop: shopParam, provider: providerParam } = params;

    if (!code || !state) throw new Error("code e state são obrigatórios");

    // Verificar state no banco
    const { data: stateRec } = await supabase
      .from("oauth_states")
      .select("*")
      .eq("state", state)
      .single();

    if (!stateRec || new Date(stateRec.expires_at) < new Date()) {
      return redirect(`${SITE_URL}/integracoes?error=state_invalido_ou_expirado`);
    }

    const provider = providerParam || stateRec.provider;
    let accessToken = "";
    let refreshToken = "";
    let mlUserId = "";
    let storeUrl = "";
    let shopName = "";

    if (provider === "shopify") {
      const shop = shopParam || stateRec.metadata?.shop_url;
      if (!shop) throw new Error("shop é obrigatório para Shopify");

      const clientId = Deno.env.get("SHOPIFY_CLIENT_ID");
      const clientSecret = Deno.env.get("SHOPIFY_CLIENT_SECRET");
      if (!clientId || !clientSecret) throw new Error("Shopify credentials não configuradas");

      const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
      });
      if (!tokenRes.ok) throw new Error(`shopify token: ${tokenRes.status}`);
      const tokenData = await tokenRes.json();
      accessToken = tokenData.access_token;
      storeUrl = `https://${shop}`;
      shopName = shop.replace(".myshopify.com", "");
    } else if (provider === "mercadolivre") {
      const clientId = Deno.env.get("MERCADOLIVRE_CLIENT_ID");
      const clientSecret = Deno.env.get("MERCADOLIVRE_CLIENT_SECRET");
      if (!clientId || !clientSecret) throw new Error("ML credentials não configuradas");

      const tokenRes = await fetch("https://api.mercadolibre.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: `${Deno.env.get("SUPABASE_URL")}/functions/v1/auth-callback`,
        }),
      });
      if (!tokenRes.ok) throw new Error(`ml token: ${tokenRes.status}`);
      const tokenData = await tokenRes.json();
      accessToken = tokenData.access_token;
      refreshToken = tokenData.refresh_token;
      mlUserId = String(tokenData.user_id);
    } else {
      return redirect(`${SITE_URL}/integracoes?error=provider_invalido`);
    }

    // Buscar user_id do state (se logado) ou criar integração sem user
    let userId = stateRec.user_id;
    if (!userId) {
      // Tentar identificar pelo token da sessão (passado como query param)
      const maybeToken = params._token;
      if (maybeToken) {
        const { data: { user } } = await supabase.auth.getUser(maybeToken);
        if (user) userId = user.id;
      }
    }

    // Upsert integration
    const credentials: Record<string, string> = {
      access_token: accessToken,
      ...(refreshToken ? { refresh_token: refreshToken } : {}),
      ...(mlUserId ? { user_id: mlUserId } : {}),
      ...(shopName ? { shop: shopName } : {}),
      ...(storeUrl ? { store_url: storeUrl } : {}),
    };

    const { error: upsertErr } = await supabase.from("integrations").upsert({
      user_id: userId,
      provider,
      label: shopName || `Mercado Livre - ${mlUserId}`,
      credentials: JSON.stringify(credentials),
      config: { store_url: storeUrl },
      status: "active",
      last_sync_at: new Date().toISOString(),
    }, { onConflict: "user_id,provider", ignoreDuplicates: false });

    // Limpar state usado
    await supabase.from("oauth_states").delete().eq("id", stateRec.id);

    if (upsertErr) {
      return redirect(`${SITE_URL}/integracoes?error=${encodeURIComponent(upsertErr.message)}`);
    }

    return redirect(`${SITE_URL}/integracoes?success=true&provider=${provider}`);
  } catch (err: any) {
    return redirect(`${SITE_URL}/integracoes?error=${encodeURIComponent(err.message)}`);
  }
});

function redirect(location: string): Response {
  return new Response(null, { status: 302, headers: { Location: location } });
}
