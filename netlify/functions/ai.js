// Secure AI proxy — holds your Anthropic key on the server, never in the browser.
export async function handler(event) {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: cors, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers: cors, body: "Method not allowed" };
  try {
    const { system, messages, max_tokens = 1000, model = "claude-haiku-4-5-20251001" } = JSON.parse(event.body || "{}");
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model, max_tokens, system, messages }),
    });
    const data = await res.json();
    const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
    return { statusCode: 200, headers: { ...cors, "content-type": "application/json" }, body: JSON.stringify({ text }) };
  } catch (e) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: String(e) }) };
  }
}
