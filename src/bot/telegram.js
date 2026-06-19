import { Bot, InlineKeyboard } from "grammy";
import { SpaceManager } from "../core/spaces.js";

/**
 * Create Telegram Bot for HFmanager
 */
export function createTelegramBot(env, kv) {
  const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

  const spaces = new SpaceManager(kv);

  // ─────────────────────────────
  // 🟢 START - DASHBOARD UI
  // ─────────────────────────────
  bot.command("start", async (ctx) => {
    const list = await spaces.getAll();

    const active = list.filter(s => s.status === "online").length;
    const down = list.filter(s => s.status === "offline").length;

    const text =
      `🧠 HFmanager Dashboard\n\n` +
      `🟢 Active: ${active}\n` +
      `🔴 Down: ${down}\n` +
      `📦 Total: ${list.length}\n\n` +
      `Choose an option:`;

    const kb = new InlineKeyboard()
      .text("📊 Status", "status")
      .text("➕ Add Space", "add")
      .row()
      .text("📡 Spaces", "list")
      .text("⚙ Settings", "settings");

    await ctx.reply(text, { reply_markup: kb });
  });

  // ─────────────────────────────
  // 📊 STATUS SCREEN
  // ─────────────────────────────
  bot.callbackQuery("status", async (ctx) => {
    const list = await spaces.getAll();

    let text = `📊 System Status\n\n`;

    for (const s of list) {
      text +=
        `🤖 ${s.name}\n` +
        `${s.status === "online" ? "🟢" : "🔴"} ${s.status}\n` +
        `⏱ ${s.latency || "N/A"}ms\n\n`;
    }

    const kb = new InlineKeyboard()
      .text("🔙 Back", "back");

    await ctx.editMessageText(text, { reply_markup: kb });
  });

  // ─────────────────────────────
  // 📡 SPACE LIST (UI)
  // ─────────────────────────────
  bot.callbackQuery("list", async (ctx) => {
    const list = await spaces.getAll();

    let text = `📡 Spaces List\n\n`;

    const kb = new InlineKeyboard();

    list.forEach((s) => {
      text += `${s.status === "online" ? "🟢" : "🔴"} ${s.name}\n`;

      kb.text(s.name, `space_${s.id}`).row();
    });

    kb.text("🔙 Back", "back");

    await ctx.editMessageText(text, { reply_markup: kb });
  });

  // ─────────────────────────────
  // 🤖 SPACE DETAIL
  // ─────────────────────────────
  bot.callbackQuery(/^space_(.+)$/, async (ctx) => {
    const id = ctx.match[1];

    const space = await spaces.get(id);

    if (!space) {
      return ctx.answerCallbackQuery("Not found");
    }

    const text =
      `🤖 ${space.name}\n\n` +
      `Status: ${space.status}\n` +
      `Latency: ${space.latency || "N/A"}ms\n` +
      `URL: ${space.url}\n`;

    const kb = new InlineKeyboard()
      .text("🔄 Wake", `wake_${id}`)
      .text("🗑 Delete", `delete_${id}`)
      .row()
      .text("🔙 Back", "list");

    await ctx.editMessageText(text, { reply_markup: kb });
  });

  // ─────────────────────────────
  // 🔄 WAKE SPACE
  // ─────────────────────────────
  bot.callbackQuery(/^wake_(.+)$/, async (ctx) => {
    const id = ctx.match[1];

    await spaces.wake(id);

    await ctx.answerCallbackQuery("Waking up...");
  });

  // ─────────────────────────────
  // 🗑 DELETE SPACE
  // ─────────────────────────────
  bot.callbackQuery(/^delete_(.+)$/, async (ctx) => {
    const id = ctx.match[1];

    await spaces.remove(id);

    await ctx.answerCallbackQuery("Deleted");

    return ctx.editMessageText("🗑 Space deleted");
  });

  // ─────────────────────────────
  // 🔙 BACK
  // ─────────────────────────────
  bot.callbackQuery("back", async (ctx) => {
    return ctx.api.sendMessage(ctx.chat.id, "/start");
  });

  // ─────────────────────────────
  // ➕ ADD SPACE (simple version)
  // ─────────────────────────────
  bot.command("add", async (ctx) => {
    const args = ctx.message.text.split(" ");

    if (args.length < 3) {
      return ctx.reply("Usage: /add <name> <url>");
    }

    const [, name, url] = args;

    await spaces.add({
      id: Date.now().toString(),
      name,
      url,
      status: "unknown"
    });

    return ctx.reply("✅ Space added");
  });

  // ─────────────────────────────
  // 📌 STATUS COMMAND (simple)
  // ─────────────────────────────
  bot.command("status", async (ctx) => {
    const list = await spaces.getAll();
    return ctx.reply(`Spaces: ${list.length}`);
  });

  return bot;
}