import { Bot, InlineKeyboard } from "grammy";
import { SpaceManager } from "../core/spaces.js";

export function createTelegramBot(env, kv) {
  const bot = new Bot(env.TELEGRAM_BOT_TOKEN);
  const spaces = new SpaceManager(kv);

  // ساده‌ترین کنترل امنیتی (اختیاری ولی حیاتی)
  const isAdmin = (ctx) => {
    return String(ctx.from?.id) === String(env.ADMIN_ID);
  };

  bot.command("start", async (ctx) => {
    try {
      if (!isAdmin(ctx)) return ctx.reply("Access denied");

      const list = await spaces.getAll();

      const active = list.filter(s => s.status === "online").length;
      const down = list.length - active;

      const text =
        `🚀 HFmanager Dashboard\n\n` +
        `🟢 Active: ${active}\n` +
        `🔴 Down: ${down}\n` +
        `📦 Total: ${list.length}`;

      const kb = new InlineKeyboard()
        .text("📊 Status", "status")
        .text("📦 Spaces", "list")
        .row()
        .text("⚙️ Settings", "settings");

      await ctx.reply(text, { reply_markup: kb });
    } catch (e) {
      console.error(e);
      await ctx.reply("Error in start command");
    }
  });

  bot.callbackQuery("status", async (ctx) => {
    try {
      if (!isAdmin(ctx)) return ctx.answerCallbackQuery("Denied");

      const list = await spaces.getAll();

      let text = `📊 System Status\n\n`;

      for (const s of list) {
        text += `• ${s.name} - ${s.status}\n`;
      }

      await ctx.editMessageText(text);
    } catch (e) {
      console.error(e);
      await ctx.answerCallbackQuery("Error");
    }
  });

  bot.callbackQuery("list", async (ctx) => {
    try {
      if (!isAdmin(ctx)) return ctx.answerCallbackQuery("Denied");

      const list = await spaces.getAll();

      let text = `📦 Spaces\n\n`;
      const kb = new InlineKeyboard();

      list.forEach((s) => {
        text += `• ${s.name} (${s.status})\n`;
        kb.text(s.name, `space_${s.id}`).row();
      });

      kb.text("⬅️ Back", "back");

      await ctx.editMessageText(text, { reply_markup: kb });
    } catch (e) {
      console.error(e);
    }
  });

  bot.callbackQuery(/^space_(.+)$/, async (ctx) => {
    try {
      if (!isAdmin(ctx)) return ctx.answerCallbackQuery("Denied");

      const id = ctx.match[1];
      const space = await spaces.get(id);

      if (!space) return ctx.answerCallbackQuery("Not found");

      const text =
        `📦 ${space.name}\n\n` +
        `Status: ${space.status}\n` +
        `URL: ${space.url}`;

      const kb = new InlineKeyboard()
        .text("⚡ Wake", `wake_${id}`)
        .text("🗑 Delete", `delete_${id}`)
        .row()
        .text("⬅️ Back", "list");

      await ctx.editMessageText(text, { reply_markup: kb });
    } catch (e) {
      console.error(e);
    }
  });

  bot.callbackQuery(/^wake_(.+)$/, async (ctx) => {
    try {
      if (!isAdmin(ctx)) return ctx.answerCallbackQuery("Denied");

      const id = ctx.match[1];
      await spaces.wake(id);

      await ctx.answerCallbackQuery("Waked");
    } catch (e) {
      console.error(e);
      await ctx.answerCallbackQuery("Error");
    }
  });

  bot.callbackQuery(/^delete_(.+)$/, async (ctx) => {
    try {
      if (!isAdmin(ctx)) return ctx.answerCallbackQuery("Denied");

      const id = ctx.match[1];
      await spaces.remove(id);

      await ctx.answerCallbackQuery("Deleted");

      try {
        await ctx.editMessageText("Deleted");
      } catch {}
    } catch (e) {
      console.error(e);
    }
  });

  bot.command("add", async (ctx) => {
    try {
      if (!isAdmin(ctx)) return ctx.reply("Access denied");

      const text = ctx.message?.text || "";
      const parts = text.split(" ");

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
    } catch (e) {
      console.error(e);
      return ctx.reply("Error adding space");
    }
  });

  return bot;
}