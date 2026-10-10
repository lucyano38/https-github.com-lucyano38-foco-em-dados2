// WooCommerce Adapter — REST API (Basic Auth or OAuth)

export async function sync(config: Record<string, any>) {
  const { store_url, consumer_key, consumer_secret } = config;
  if (!store_url || !consumer_key || !consumer_secret) throw new Error("woo: store_url, consumer_key e consumer_secret obrigatórios");

  const base = store_url.replace(/\/$/, "");
  const auth = btoa(`${consumer_key}:${consumer_secret}`);

  const since = new Date(Date.now() - 30 * 86400000).toISOString();

  // Buscar pedidos
  const ordersRes = await fetch(
    `${base}/wp-json/wc/v3/orders?after=${since}&per_page=100`,
    { headers: { Authorization: `Basic ${auth}` } }
  );
  if (!ordersRes.ok) throw new Error(`woo orders: ${ordersRes.status} ${await ordersRes.text()}`);
  const orders = await ordersRes.json();

  const normalizedOrders = (orders || []).map((o: any) => ({
    external_id: String(o.id),
    external_code: o.number ? `#${o.number}` : null,
    customer_name: `${o.billing?.first_name || ""} ${o.billing?.last_name || ""}`.trim() || null,
    customer_email: o.billing?.email || null,
    customer_doc: o.billing?.cpf || null,
    items: (o.line_items || []).map((li: any) => ({
      external_id: String(li.id),
      product_id: String(li.product_id),
      sku: li.sku,
      name: li.name,
      quantity: li.quantity,
      price: parseFloat(li.price) || 0,
    })),
    total_amount: parseFloat(o.total) || 0,
    discount: parseFloat(o.discount_total) || 0,
    shipping: parseFloat(o.shipping_total) || 0,
    payment_method: o.payment_method_title,
    installments: o.meta_data?.find((m: any) => m.key === "_installments")?.value || 1,
    status: mapWooStatus(o.status),
    ordered_at: o.date_created,
    raw_data: o,
  }));

  // Buscar produtos
  const productsRes = await fetch(
    `${base}/wp-json/wc/v3/products?per_page=100`,
    { headers: { Authorization: `Basic ${auth}` } }
  );
  if (!productsRes.ok) throw new Error(`woo products: ${productsRes.status}`);
  const products = await productsRes.json();

  const normalizedProducts = (products || []).map((p: any) => ({
    external_id: String(p.id),
    sku: p.sku || null,
    name: p.name,
    description: p.description ? p.description.replace(/<[^>]*>/g, "") : "",
    category: p.categories?.[0]?.name || null,
    brand: p.brands?.[0]?.name || null,
    price: parseFloat(p.price) || 0,
    cost: 0,
    stock: p.stock_quantity || 0,
    images: (p.images || []).map((img: any) => img.src),
    variants: [],
    status: p.stock_status,
  }));

  return { normalizedOrders, normalizedProducts };
}

function mapWooStatus(status: string): string {
  const map: Record<string, string> = {
    completed: "delivered",
    processing: "shipped",
    "on-hold": "pending",
    pending: "pending",
    cancelled: "cancelled",
    refunded: "refunded",
    failed: "cancelled",
  };
  return map[status] || "pending";
}
