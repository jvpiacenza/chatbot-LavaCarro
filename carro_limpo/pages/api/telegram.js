// pages/api/telegram.js
import { Telegraf } from 'telegraf';
import crypto from 'crypto';

// Inicializa o bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply('Olá! Bem-vindo ao atendimento do Lava-Jato. Como posso ajudar?');
});

// Quando o usuário manda qualquer texto no Telegram
bot.on('text', async (ctx) => {
  const userMessage = ctx.message.text;
  
  // Usamos o ID do usuário do Telegram para separar as sessões do Dialogflow
  const sessionId = ctx.from.id.toString(); 

  const projectId = process.env.DIALOGFLOW_PROJECT_ID;
  const clientEmail = process.env.DIALOGFLOW_CLIENT_EMAIL;
  const privateKey = process.env.DIALOGFLOW_PRIVATE_KEY?.replace(/\\n/g, "\n");

  try {
    // 1. Pega o Token do Google
    const token = await getAccessToken(clientEmail, privateKey);

    // 2. Prepara a requisição para o Dialogflow
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
          text: { text: userMessage, languageCode: "pt-BR" },
        },
      }),
    });

    const data = await response.json();

    // 3. Pega a resposta da IA e envia de volta no Telegram
    const reply = data?.queryResult?.fulfillmentText || "Desculpe, não entendi. Pode repetir?";
    await ctx.reply(reply);

  } catch (err) {
    console.error("Erro na integração Telegram -> Dialogflow:", err);
    await ctx.reply("Ops, nosso sistema está passando por uma instabilidade. Tente novamente em alguns minutos!");
  }
});

// --- Handler do Next.js / Vercel ---
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await bot.handleUpdate(req.body);
      res.status(200).send('OK');
    } catch (error) {
      console.error('Erro no webhook do Telegram:', error);
      res.status(500).send('Erro interno');
    }
  } else {
    res.status(200).send('Webhook do bot está ativo!');
  }
}

// --- Funções Auxiliares de Autenticação (Iguais ao seu chat.js) ---

function toBase64Url(str) {
  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function getAccessToken(clientEmail, privateKey) {
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

  if (!tokenData.access_token) {
    throw new Error("Token inválido");
  }

  return tokenData.access_token;
}