import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const ADAPTERS: Record<string, string> = {
  shopify: "./adapters/shopify.ts",
  woocommerce: "./adapters/woo.ts",
  mercadolivre: "./adapters/ml.ts",
};

Deno.serve(async (req) => {
  try {
    const { integration_id } = await req.json();
    if (!integration_id) throw new Error("integration_id é obrigatório");

    // 1. Buscar configuração da integração
    const { data: int, error: intErr } = await supabase
      .from("integrations")
      .select("*")
      .eq("id", integration_id)
      .single();
    if (intErr || !int) throw new Error("Integração não encontrada");

    const provider = int.provider;
    const adapterPath = ADAPTERS[provider];
    if (!adapterPath) throw new Error(`Adaptador não encontrado para: ${provider}`);

    // 2. Atualizar status para syncing
    await supabase.from("integrations").update({ status: "active" }).eq("id", integration_id);

    // 3. Chamar adaptador específico
    const adapter = await import(adapterPath);
    const config = int.credentials ? JSON.parse(int.credentials) : int.config;
    const result = await adapter.sync(config);

    // 4. Salvar pedidos normalizados
    if (result.normalizedOrders?.length > 0) {
      const ordersWithIds = result.normalizedOrders.map((o: any) => ({
        ...o,
        integration_id,
        user_id: int.user_id,
      }));
      const { error: upsertErr } = await supabase
        .from("orders")
        .upsert(ordersWithIds, { onConflict: "integration_id,external_id", ignoreDuplicates: false });
      if (upsertErr) console.error("orders upsert error:", upsertErr);
    }

    // 5. Salvar produtos normalizados
    if (result.normalizedProducts?.length > 0) {
      const productsWithIds = result.normalizedProducts.map((p: any) => ({
        ...p,
        integration_id,
        user_id: int.user_id,
      }));
      const { error: prodErr } = await supabase
        .from("products")
        .upsert(productsWithIds, { onConflict: "integration_id,external_id", ignoreDuplicates: false });
      if (prodErr) console.error("products upsert error:", prodErr);
    }

    // 6. Atualizar tokens se adaptador retornou novos (ML refresh)
    if (result.newTokens) {
      await supabase
        .from("integrations")
        .update({ credentials: JSON.stringify(result.newTokens) })
        .eq("id", integration_id);
    }

    // 7. Marcar sync concluído
    await supabase.from("integrations").update({
      last_sync_at: new Date().toISOString(),
      error_message: null,
    }).eq("id", integration_id);

    // 8. Registrar uso
    await supabase.from("usage_logs").insert({
      user_id: int.user_id,
      feature: "api_calls",
      quantity: 1,
      date: new Date().toISOString().split("T")[0],
      metadata: { integration_id, provider, orders: result.normalizedOrders?.length || 0 },
    });

    return new Response(JSON.stringify({
      status: "success",
      integration_id,
      provider,
      orders_synced: result.normalizedOrders?.length || 0,
      products_synced: result.normalizedProducts?.length || 0,
      tokens_updated: !!result.newTokens,
    }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
});
