import { getCorsHeaders } from "../_shared/supabase-admin.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders(req.headers.get("origin")) });
  }

  try {
    const url = new URL(req.url);
    const pixCode = url.searchParams.get("pix") || "000201010212261060014br.gov.bcb.pix2588pix@focoemdados.com.br520400005303986540610.005802BR5913VarejoBI6008SaoPaulo62090504Clube6304E9B4";

    const qrResponse = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`);
    const qrBuffer = await qrResponse.arrayBuffer();

    return new Response(qrBuffer, {
      status: 200,
      headers: {
        ...getCorsHeaders(req.headers.get("origin")),
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...getCorsHeaders(req.headers.get("origin")), "Content-Type": "application/json" },
    });
  }
});
