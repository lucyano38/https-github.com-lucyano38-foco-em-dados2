import { supabaseAdmin, getCorsHeaders } from "../_shared/supabase-admin.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders(req.headers.get("origin")) });
  }

  try {
    const { name, email, uid } = await req.json();
    if (!email || !uid) throw new Error("email e uid são obrigatórios.");

    const role = email.toLowerCase() === "lucyano.pci@gmail.com" ? "Master" : "user";

    await supabaseAdmin.from("users").upsert({
      id: uid,
      email: email.toLowerCase(),
      name: name || email.split("@")[0],
      role,
      status: "active",
    }, { onConflict: "id" });

    return new Response(JSON.stringify({ success: true, role }), {
      status: 200,
      headers: { ...getCorsHeaders(req.headers.get("origin")), "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...getCorsHeaders(req.headers.get("origin")), "Content-Type": "application/json" },
    });
  }
});
