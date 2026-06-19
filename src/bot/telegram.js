import { Bot, InlineKeyboard } from "grammy";
import { SpaceManager } from "../core/spaces.js";

export function createTelegramBot(env, kv) {
  const bot = new Bot(env.TELEGRAM_BOT_TOKEN);
  const spaces = new SpaceManager(kv);

  bot.command("start", async (ctx) => {
    const list = await spaces.getAll();

    const active = list.filter(s => s.status === "online").length;
    const down = list.filter(s => s.status !== "online").length;

    const text =
      `🧠 HFmanager Dashboard\n\n` +
      `🟢 Active: ${active}\n` +
      `🔴 Down: ${down}\n` +
      `📦 Total: ${list.length}`;

    const kb = new InlineKeyboard()
      .text("📊 Status", "status")
      .text("📡 Spaces", "list")
      .row()
      .text("➕ Add", "add")
      .text("⚙ Settings", "settings");

    await ctx.reply(text, { reply_markup: kb });
  });

  bot.callbackQuery("status", async (ctx) => {
    const list = await spaces.getAll();

    let text = `📊 System Status\n\n`;

    for (const s of list) {
      text += `• ${s.name} - ${s.status}\n`;
    }

    await ctx.editMessageText(text);
  });

  bot.callbackQuery("list", async (ctx) => {
    const list = await spaces.getAll();

    let text = `📡 Spaces\n\n`;
    const kb = new InlineKeyboard();

    list.forEach((s) => {
      text += `• ${s.name} (${s.status})\n`;
      kb.text(s.name, `space_${s.id}`).row();
    });

    kb.text("⬅ Back", "back");

    await ctx.editMessageText(text, { reply_markup: kb });
  });

  bot.callbackQuery(/^space_(.+)$/, async (ctx) => {
    const id = ctx.match[1];
    const space = await spaces.get(id);

    if (!space) return ctx.answerCallbackQuery("Not found");

    const text =
      `📦 ${space.name}\n\n` +
      `Status: ${space.status}\n` +
      `URL: ${space.url}`;

    const kb = new InlineKeyboard()
      .text("🔄 Wake", `wake_${id}`)
      .text("🗑 Delete", `delete_${id}`)
      .row()
      .text("⬅ Back", "list");

    await ctx.editMessageText(text, { reply_markup: kb });
  });

  bot.callbackQuery(/^wake_(.+)$/, async (ctx) => {
    const id = ctx.match[1];
    await spaces.wake(id);
    await ctx.answerCallbackQuery("Waked");
  });

  bot.callbackQuery(/^delete_(.+)$/, async (ctx) => {
    const id = ctx.match[1];
    await spaces.remove(id);
    await ctx.answerCallbackQuery("Deleted");
    await ctx.editMessageText("Deleted");
  });

  bot.command("add", async (ctx) => {
    const parts = ctx.message.text.split(" ");

    if (parts.length < 3) {
      return ctx.reply("Usage: /add <name> <url>");
    }

    const [, name, url] = parts;

    await spaces.add({
      id: Date.now().toString(),
      name,
      url,
      status: "offline"
    });

    return ctx.reply("Added");
  });

  return bot;
}