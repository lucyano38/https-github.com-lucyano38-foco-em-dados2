// Mercado Livre Adapter — REST API (OAuth2)

const TOKEN_URL = "https://api.mercadolibre.com/oauth/token";
const API_BASE = "https://api.mercadolibre.com";

async function refreshToken(refresh_token: string, client_id: string, client_secret: string): Promise<Record<string, any>> {
  const r = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id,
      client_secret,
      refresh_token,
    }),
  });
  if (!r.ok) throw new Error(`ml refresh: ${r.status} ${await r.text()}`);
  return r.json();
}

async function fetchWithAuth(url: string, accessToken: string): Promise<any> {
  const r = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!r.ok) throw new Error(`ml fetch: ${r.status} ${await r.text()}`);
  return r.json();
}

export async function sync(config: Record<string, any>) {
  const { access_token, refresh_token, client_id, client_secret, user_id: mlUserId } = config;
  if (!access_token) throw new Error("ml: access_token obrigatório");

  let token = access_token;
  let newTokens: Record<string, any> | null = null;

  // Tentar refresh se veio refresh_token configurado
  if (refresh_token && client_id && client_secret) {
    try {
      const refreshed = await refreshToken(refresh_token, client_id, client_secret);
      token = refreshed.access_token;
      newTokens = {
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token,
        expires_in: refreshed.expires_in,
      };
    } catch (e) {
      console.warn("ml: refresh falhou, usando token atual:", e);
    }
  }

  // Buscar vendas (orders) dos últimos 30 dias
  const sellerId = mlUserId || (await fetchWithAuth(`${API_BASE}/users/me`, token)).id;
  const since = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];

  const salesRes = await fetchWithAuth(
    `${API_BASE}/orders/search?seller=${sellerId}&order.date_created.from=${since}&limit=200`,
    token
  );
  const sales = salesRes?.results || [];

  const normalizedOrders = (sales || []).map((o: any) => ({
    external_id: String(o.id),
    external_code: null,
    customer_name: o.buyer?.nickname || null,
    customer_email: null,
    items: (o.order_items || []).map((oi: any) => ({
      external_id: String(oi.item?.id),
      product_id: String(oi.item?.id),
      sku: oi.item?.seller_sku || null,
      name: oi.item?.title || "",
      quantity: oi.quantity || 1,
      price: parseFloat(oi.unit_price) || 0,
    })),
    total_amount: parseFloat(o.total_amount) || 0,
    discount: parseFloat(o.paid_amount || 0) - parseFloat(o.total_amount || 0),
    shipping: 0,
    payment_method: o.payments?.[0]?.payment_type || null,
    installments: o.payments?.[0]?.installments || 1,
    status: mapMLStatus(o.status),
    ordered_at: o.date_created,
    raw_data: o,
  }));

  // Buscar anúncios (products)
  const itemsRes = await fetchWithAuth(
    `${API_BASE}/users/${sellerId}/items/search?search_type=scan&limit=100`,
    token
  );
  const itemIds: string[] = itemsRes?.results || [];

  const normalizedProducts: any[] = [];
  for (let i = 0; i < itemIds.length; i += 20) {
    const batch = itemIds.slice(i, i + 20);
    const details = await fetchWithAuth(`${API_BASE}/items?ids=${batch.join(",")}`, token);
    for (const d of details || []) {
      const body = d?.body;
      if (!body) continue;
      normalizedProducts.push({
        external_id: String(body.id),
        sku: body.seller_sku || null,
        name: body.title,
        description: body.description?.plain_text || "",
        category: body.category_id,
        brand: null,
        price: parseFloat(body.price) || 0,
        cost: 0,
        stock: body.available_quantity || 0,
        images: (body.pictures || []).map((p: any) => p.url),
        variants: (body.variations || []).map((v: any) => ({
          id: String(v.id),
          title: v.attribute_combinations?.map((a: any) => a.value_name).join(" / ") || "",
          price: parseFloat(v.price) || parseFloat(body.price) || 0,
          stock: v.available_quantity || 0,
        })),
        status: body.status === "active" ? "active" : "inactive",
      });
    }
  }

  return { normalizedOrders, normalizedProducts, newTokens };
}

function mapMLStatus(status: string): string {
  const map: Record<string, string> = {
    paid: "approved",
    confirmed: "approved",
    shipped: "shipped",
    delivered: "delivered",
    cancelled: "cancelled",
    refunded: "refunded",
    "to_guide": "shipped",
  };
  return map[status] || "pending";
}
