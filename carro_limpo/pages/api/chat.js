// pages/api/chat.js

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { message, sessionId } = req.body;

  const projectId = process.env.DIALOGFLOW_PROJECT_ID;
  const clientEmail = process.env.DIALOGFLOW_CLIENT_EMAIL;
  const privateKey = process.env.DIALOGFLOW_PRIVATE_KEY?.replace(/\\n/g, "\n");

  try {
    const token = await getAccessToken(clientEmail, privateKey);

    const url = `https://dialogflow.googleapis.com/v2/projects/${projectId}/agent/sessions/${sessionId}:detectIntent`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-goog-user-project": projectId,
      },
      body: JSON.stringify({
        queryInput: {
          text: { text: message, languageCode: "pt-BR" },
        },
      }),
    });

    const data = await response.json();

    // Log para debug — vai aparecer nos logs do Vercel
    console.log("Dialogflow response:", JSON.stringify(data));

    const reply =
      data?.queryResult?.fulfillmentText || "Não entendi. Pode repetir?";

    res.status(200).json({ reply });
  } catch (err) {
    console.error("Erro no handler:", err);
    res.status(500).json({ reply: "Erro interno. Tente novamente." });
  }
}

// ✅ CORREÇÃO: base64url em vez de base64 puro
function toBase64Url(str) {
  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function getAccessToken(clientEmail, privateKey) {
  // ✅ Agora header e claim também são base64url
  const header = toBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const claim = toBase64Url(
    JSON.stringify({
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    })
  );

  const crypto = await import("crypto");
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(`${header}.${claim}`);
  const signature = sign
    .sign(privateKey, "base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const jwt = `${header}.${claim}.${signature}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json();

  // ✅ Log para debug do token
  if (!tokenData.access_token) {
    console.error("Falha ao obter token:", JSON.stringify(tokenData));
    throw new Error("Token inválido");
  }

  return tokenData.access_token;
}