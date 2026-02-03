export default async function handler(req, res) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(200).end();
  }

  const TARGET_URL =
    "https://startprev.app.n8n.cloud/webhook/6ca64ba2-92de-4941-b0fc-a2c15d0cb962";

  try {
    const options = {
      method: req.method,
      headers: {
        "Content-Type": req.headers["content-type"] || "application/json",
      },
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      options.body =
        typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(TARGET_URL, options);
    const data = await response.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("X-Powered-By", "DataStart");

    const ct = response.headers.get("content-type");
    if (ct) res.setHeader("Content-Type", ct);

    res.status(response.status).send(data);
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}
