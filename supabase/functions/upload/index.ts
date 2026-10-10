import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

function corsHeaders(origin: string | null) {
  const allowed = ["https://focoemdados.com.br", "http://localhost:5173", "http://localhost:3000"];
  const value = origin && allowed.includes(origin) ? origin : "https://focoemdados.com.br";
  return { "Access-Control-Allow-Origin": value, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "authorization, content-type" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) throw new Error("Nenhum arquivo enviado.");

    const userToken = req.headers.get("authorization")?.replace("Bearer ", "");
    let uid = "";
    if (userToken) {
      const { data: { user } } = await supabase.auth.getUser(userToken);
      if (user) uid = user.id;
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const storagePath = `${uid || "anon"}/${Date.now()}-${file.name}`;

    const { error: uploadErr } = await supabase.storage
      .from("uploads")
      .upload(storagePath, bytes, { contentType: file.type, upsert: false });
    if (uploadErr) throw uploadErr;

    const { data: record, error: dbErr } = await supabase
      .from("data_uploads")
      .insert({
        user_id: uid || null,
        filename: storagePath,
        original_name: file.name,
        file_size: bytes.length,
        mime_type: file.type,
        status: "pending",
      })
      .select()
      .single();
    if (dbErr) throw dbErr;

    // Async processing — não bloqueia resposta
    supabase.functions.invoke("process-upload", {
      body: { upload_id: record.id, storage_path: storagePath },
    }).catch((e) => console.error("process-upload trigger failed:", e));

    return new Response(JSON.stringify({ success: true, upload_id: record.id, status: "pending" }), {
      status: 202,
      headers: { ...corsHeaders(req.headers.get("origin")), "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders(req.headers.get("origin")), "Content-Type": "application/json" },
    });
  }
});
