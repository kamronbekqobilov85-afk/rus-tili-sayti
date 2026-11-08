const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL = process.env.TELEGRAM_CHANNEL_USERNAME || "@rustili24soat";

function api(method: string) {
  return `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
}

export async function tgSendMessage(chatId: string | number, text: string) {
  if (!BOT_TOKEN) return;
  try {
    await fetch(api("sendMessage"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
  } catch {
    // xabar yuborilmasa ham oqim davom etadi
  }
}

export async function tgIsChannelMember(telegramUserId: string | number): Promise<boolean> {
  if (!BOT_TOKEN) return false;
  try {
    const res = await fetch(
      `${api("getChatMember")}?chat_id=${encodeURIComponent(CHANNEL)}&user_id=${telegramUserId}`
    );
    const data = await res.json();
    const status = data?.result?.status;
    return status === "member" || status === "administrator" || status === "creator";
  } catch {
    return false;
  }
}

export async function tgSetWebhook(url: string, secret: string) {
  if (!BOT_TOKEN) return null;
  const res = await fetch(api("setWebhook"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, secret_token: secret }),
  });
  return res.json();
}
