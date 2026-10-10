// Shopify Adapter — REST Admin API

export async function sync(config: Record<string, any>) {
  const { store_url, access_token, api_version = "2024-10" } = config;
  if (!store_url || !access_token) throw new Error("shopify: store_url e access_token obrigatórios");

  const base = store_url.replace(/\/$/, "");
  const headers = { "X-Shopify-Access-Token": access_token, "Content-Type": "application/json" };

  // Buscar pedidos dos últimos 30 dias
  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const res = await fetch(`${base}/admin/api/${api_version}/orders.json?status=any&updated_at_min=${since}&limit=250`, { headers });
  if (!res.ok) throw new Error(`shopify orders: ${res.status} ${await res.text()}`);

  const { orders } = await res.json();

  const normalizedOrders = (orders || []).map((o: any) => ({
    external_id: String(o.id),
    external_code: o.order_number ? `#${o.order_number}` : null,
    customer_name: o.customer ? `${o.customer.first_name || ""} ${o.customer.last_name || ""}`.trim() : null,
    customer_email: o.customer?.email || null,
    items: (o.line_items || []).map((li: any) => ({
      external_id: String(li.id),
      product_id: String(li.product_id),
      variant_id: String(li.variant_id),
      sku: li.sku,
      name: li.title,
      quantity: li.quantity,
      price: parseFloat(li.price) || 0,
    })),
    total_amount: parseFloat(o.total_price) || 0,
    discount: parseFloat(o.total_discounts) || 0,
    shipping: parseFloat(o.total_shipping_price_set?.shop_money?.amount || 0),
    payment_method: o.gateway,
    installments: 1,
    status: mapShopifyStatus(o.financial_status),
    ordered_at: o.created_at,
    raw_data: o,
  }));

  // Buscar produtos (paginado)
  let products: any[] = [];
  let url: string | null = `${base}/admin/api/${api_version}/products.json?limit=250`;
  while (url) {
    const r = await fetch(url, { headers });
    if (!r.ok) break;
    const d = await r.json();
    products = products.concat(d.products || []);
    const link = r.headers.get("link") || "";
    const nextMatch = link.match(/<([^>]+)>;\s*rel="next"/);
    url = nextMatch ? nextMatch[1] : null;
  }

  const normalizedProducts = (products || []).map((p: any) => ({
    external_id: String(p.id),
    sku: p.variants?.[0]?.sku || null,
    name: p.title,
    description: p.body_html ? p.body_html.replace(/<[^>]*>/g, "") : "",
    category: p.product_type,
    brand: p.vendor,
    price: parseFloat(p.variants?.[0]?.price || 0),
    cost: 0,
    stock: (p.variants || []).reduce((s: number, v: any) => s + (v.inventory_quantity || 0), 0),
    images: (p.images || []).map((img: any) => img.src),
    variants: (p.variants || []).map((v: any) => ({
      id: String(v.id),
      title: v.title,
      sku: v.sku,
      price: parseFloat(v.price) || 0,
      stock: v.inventory_quantity || 0,
    })),
    status: p.status,
  }));

  return { normalizedOrders, normalizedProducts };
}

function mapShopifyStatus(financial: string): string {
  const map: Record<string, string> = {
    paid: "approved",
    pending: "pending",
    refunded: "refunded",
    voided: "cancelled",
    partially_refunded: "refunded",
  };
  return map[financial] || "pending";
}
