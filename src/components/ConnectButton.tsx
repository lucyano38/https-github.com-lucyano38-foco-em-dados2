import { useState } from "react";
import { supabase } from "../lib/supabase";

const PROVIDER_INFO: Record<string, { label: string; icon: string; docs: string }> = {
  shopify: { label: "Shopify", icon: "🛒", docs: "Loja Shopify" },
  woocommerce: { label: "WooCommerce", icon: "🐘", docs: "WP Admin → WooCommerce → Configurações → Avançado → API → Chaves" },
  mercadolivre: { label: "Mercado Livre", icon: "📦", docs: "App Mercado Livre" },
};

export default function ConnectButton({ provider, onSync }: { provider: string; onSync?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showWooForm, setShowWooForm] = useState(false);
  const [wooKeys, setWooKeys] = useState({ store_url: "", consumer_key: "", consumer_secret: "" });

  const handleOAuthConnect = async () => {
    setLoading(true);
    setError("");
    try {
      const shopUrl = provider === "shopify"
        ? prompt("URL da sua loja Shopify (ex: minhaloja.myshopify.com):")
        : null;
      if (provider === "shopify" && !shopUrl) { setLoading(false); return; }

      const { data, error: fnErr } = await supabase.functions.invoke("get-auth-url", {
        body: { provider, shop_url: shopUrl || undefined },
      });
      if (fnErr) throw fnErr;
      if (!data?.url) throw new Error("URL de autenticação não recebida");

      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleWooConnect = async () => {
    if (!wooKeys.store_url || !wooKeys.consumer_key || !wooKeys.consumer_secret) {
      setError("Preencha todos os campos");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error: dbErr } = await supabase.from("integrations").upsert({
        user_id: user.id,
        provider: "woocommerce",
        label: wooKeys.store_url.replace(/https?:\/\//, "").replace(/\/$/, ""),
        credentials: JSON.stringify(wooKeys),
        config: { store_url: wooKeys.store_url },
        status: "active",
        last_sync_at: new Date().toISOString(),
      }, { onConflict: "user_id,provider" });
      if (dbErr) throw dbErr;

      setShowWooForm(false);
      if (onSync) onSync();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (provider === "woocommerce" && showWooForm) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-slate-800 p-6 rounded-xl w-full max-w-md">
          <h3 className="text-lg font-bold text-white mb-4">Conectar WooCommerce</h3>
          <p className="text-slate-400 text-sm mb-4">
            Vá em WP Admin → WooCommerce → Configurações → Avançado → API → Adicionar chave
          </p>
          {["store_url", "consumer_key", "consumer_secret"].map((field) => (
            <input
              key={field}
              type={field === "consumer_secret" ? "password" : "text"}
              placeholder={field === "store_url" ? "https://minhaloja.com" : field}
              value={(wooKeys as any)[field]}
              onChange={(e) => setWooKeys({ ...wooKeys, [field]: e.target.value })}
              className="w-full p-2 mb-2 rounded bg-slate-700 text-white border border-slate-600"
            />
          ))}
          {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
          <div className="flex gap-2">
            <button onClick={() => setShowWooForm(false)} className="flex-1 p-2 rounded bg-slate-600 text-white">Cancelar</button>
            <button onClick={handleWooConnect} disabled={loading} className="flex-1 p-2 rounded bg-cyan-600 text-white font-semibold">
              {loading ? "Conectando..." : "Conectar"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const info = PROVIDER_INFO[provider] || { label: provider, icon: "🔌", docs: "" };

  return (
    <div>
      <button
        onClick={provider === "woocommerce" ? () => setShowWooForm(true) : handleOAuthConnect}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition disabled:opacity-50"
      >
        <span>{info.icon}</span>
        <span>{loading ? "Conectando..." : `Conectar ${info.label}`}</span>
      </button>
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}
