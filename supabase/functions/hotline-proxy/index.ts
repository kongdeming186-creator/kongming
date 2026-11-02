// 长丰街道 12345 热线工单 Excel 接口代理
// 服务端转发上游公开接口（无鉴权），绕过浏览器 CORS 限制，返回 Excel 二进制流
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

// 上游公开导出接口（硬编码官方域名，无需任何凭证）
const UPSTREAM_URL =
  "https://uodcm-api.qiaokou.gov.cn/admin-api/event/event/export-excel-public?deptId=102";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const upstream = await fetch(UPSTREAM_URL, { method: "GET" });
    if (!upstream.ok) {
      return new Response(
        JSON.stringify({ error: `上游接口请求失败（HTTP ${upstream.status}）` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const buf = await upstream.arrayBuffer();
    return new Response(buf, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/octet-stream",
        "Cache-Control": "public, max-age=30",
      },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "代理请求异常" }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});