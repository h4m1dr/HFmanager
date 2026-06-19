import { createTelegramBot } from "./bot/telegram.js";
import { KVStore } from "./utils/kv.js";
import { SpaceManager } from "./core/spaces.js";
import { webhookCallback } from "grammy";

export default {
  async fetch(request, env, ctx) {

    // =========================
    // Init KV wrapper
    // =========================
    const kv = new KVStore(env.HF_SPACES_KV);

    // =========================
    // Init core manager
    // =========================
    const manager = new SpaceManager(kv);

    // =========================
    // Init Telegram bot
    // =========================
    const bot = createTelegramBot(env, kv);

    const handleUpdate = webhookCallback(bot, "cloudflare-mod");

    const url = new URL(request.url);

    // =========================
    // HEALTH CHECK
    // =========================
    if (url.pathname === "/health") {
      return new Response("HFmanager OK", { status: 200 });
    }

    // =========================
    // STATUS API
    // =========================
    if (url.pathname === "/api/status") {
      const report = await manager.getReport();

      return new Response(JSON.stringify(report, null, 2), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // =========================
    // WAKE ALL SPACES
    // =========================
    if (url.pathname === "/api/wake-all") {
      const result = await manager.wakeAll();

      return new Response(JSON.stringify(result, null, 2), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // =========================
    // TELEGRAM WEBHOOK
    // =========================
    if (url.pathname === "/webhook") {
      return handleUpdate(request, env, ctx);
    }

    return new Response("HFmanager running");
  }
};