import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import ConnectButton from "../components/ConnectButton";

type Integration = {
  id: string;
  provider: string;
  label: string;
  status: string;
  last_sync_at: string | null;
  error_message: string | null;
};

const PROVIDERS = ["shopify", "woocommerce", "mercadolivre"];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [syncing, setSyncing] = useState<string | null>(null);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("integrations").select("*").eq("user_id", user.id);
    if (data) setIntegrations(data);
  };

  useEffect(() => { load(); }, []);

  const handleSync = async (id: string) => {
    setSyncing(id);
    try {
      await supabase.functions.invoke("sync-integration", { body: { integration_id: id } });
      await load();
    } catch (err: any) {
      alert(err.message);
    }
    setSyncing(null);
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm("Desconectar esta integração?")) return;
    await supabase.from("integrations").update({ status: "disabled" }).eq("id", id);
    await load();
  };

  const getProviderIcon = (p: string) => {
    const icons: Record<string, string> = { shopify: "🛒", woocommerce: "🐘", mercadolivre: "📦" };
    return icons[p] || "🔌";
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Integrações</h1>
        <p className="text-slate-400 mb-6">Conecte sua loja para sincronizar pedidos e produtos automaticamente.</p>

        <div className="grid gap-4 mb-8">
          {integrations.map((int) => (
            <div key={int.id} className="bg-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getProviderIcon(int.provider)}</span>
                <div>
                  <p className="text-white font-medium">{int.label || int.provider}</p>
                  <p className="text-slate-400 text-sm">
                    {int.status === "active" ? "✅ Conectado" : "⛔ Desconectado"}
                    {int.last_sync_at && ` · Última sync: ${new Date(int.last_sync_at).toLocaleDateString("pt-BR")}`}
                  </p>
                  {int.error_message && <p className="text-red-400 text-xs mt-1">{int.error_message}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSync(int.id)}
                  disabled={syncing === int.id || int.status !== "active"}
                  className="px-3 py-1.5 rounded bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-500 disabled:opacity-50"
                >
                  {syncing === int.id ? "Sincronizando..." : "Sincronizar"}
                </button>
                <button
                  onClick={() => handleDisconnect(int.id)}
                  className="px-3 py-1.5 rounded bg-red-600/20 text-red-400 text-sm hover:bg-red-600/40"
                >
                  Desconectar
                </button>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-bold text-white mb-3">Adicionar integração</h2>
        <div className="flex flex-wrap gap-3">
          {PROVIDERS.filter((p) => !integrations.some((i) => i.provider === p && i.status === "active")).map(
            (provider) => (
              <ConnectButton key={provider} provider={provider} onSync={load} />
            )
          )}
        </div>
      </div>
    </div>
  );
}
