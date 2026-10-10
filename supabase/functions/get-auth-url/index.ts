import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const BASE_URL = Deno.env.get("SUPABASE_URL")!;
const SITE_URL = "https://focoemdados.com.br";

interface OAuthConfig {
  authorizeUrl: string;
  params: Record<string, string>;
}

function getShopifyConfig(): OAuthConfig {
  const clientId = Deno.env.get("SHOPIFY_CLIENT_ID");
  if (!clientId || clientId === "SET_MANUALLY_NO_DASHBOARD") throw new Error("SHOPIFY_CLIENT_ID não configurado");
  return {
    authorizeUrl: "https://{shop}.myshopify.com/admin/oauth/authorize",
    params: {
      client_id: clientId,
      scope: "read_products,read_orders,write_orders",
      redirect_uri: `${BASE_URL}/functions/v1/auth-callback`,
      state: "", // será preenchido dinamicamente
    },
  };
}

function getMercadoLivreConfig(): OAuthConfig {
  const clientId = Deno.env.get("MERCADOLIVRE_CLIENT_ID");
  if (!clientId || clientId === "SET_MANUALLY_NO_DASHBOARD") throw new Error("MERCADOLIVRE_CLIENT_ID não configurado");
  return {
    authorizeUrl: "https://auth.mercadolivre.com.br/authorization",
    params: {
      client_id: clientId,
      response_type: "code",
      redirect_uri: `${BASE_URL}/functions/v1/auth-callback`,
      state: "",
    },
  };
}

Deno.serve(async (req) => {
  try {
    const { provider, shop_url } = await req.json();
    if (!provider) throw new Error("provider é obrigatório (shopify, mercadolivre)");

    const configs: Record<string, () => OAuthConfig> = {
      shopify: getShopifyConfig,
      mercadolivre: getMercadoLivreConfig,
    };

    const getConfig = configs[provider];
    if (!getConfig) throw new Error(`Provider não suportado: ${provider}`);

    const cfg = getConfig();
    const state = crypto.randomUUID();

    // Salvar state no banco
    await supabase.from("oauth_states").insert({
      provider,
      state,
      redirect_uri: cfg.params.redirect_uri,
      metadata: provider === "shopify" ? { shop_url: shop_url || null } : {},
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

    let url: string;
    if (provider === "shopify") {
      const shop = shop_url?.replace(/\.myshopify\.com$/, "").replace(/https?:\/\//, "");
      if (!shop) throw new Error("shop_url é obrigatório para Shopify");
      url = `https://${shop}.myshopify.com/admin/oauth/authorize?client_id=${cfg.params.client_id}&scope=${cfg.params.scope}&redirect_uri=${encodeURIComponent(cfg.params.redirect_uri)}&state=${state}`;
    } else {
      const p = new URLSearchParams({ ...cfg.params, state });
      url = `${cfg.authorizeUrl}?${p}`;
    }

    return new Response(JSON.stringify({ url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
});
