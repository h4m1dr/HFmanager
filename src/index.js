import { createTelegramBot } from "./bot/telegram.js";
import { KVStore } from "./utils/kv.js";
import { SpaceManager } from "./core/spaces.js";
import { webhookCallback } from "grammy";

export default {
  async fetch(request, env, ctx) {
    try {
      if (!env.HF_SPACES_KV) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "HF_SPACES_KV binding is missing"
          }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      }

      const kv = new KVStore(env.HF_SPACES_KV);
      const manager = new SpaceManager(kv);

      const url = new URL(request.url);

      // Health Check
      if (url.pathname === "/health") {
        return new Response(
          JSON.stringify({
            success: true,
            service: "HFmanager",
            status: "online",
            timestamp: Date.now()
          }),
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      }

      // Status API
      if (url.pathname === "/api/status") {
        const report = await manager.getReport();

        return new Response(
          JSON.stringify(report, null, 2),
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      }

      // Wake All
      if (url.pathname === "/api/wake-all") {
        const result = await manager.wakeAll();

        return new Response(
          JSON.stringify(result, null, 2),
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );
      }

      // Telegram Webhook
      if (url.pathname === "/webhook") {
        if (!env.TELEGRAM_BOT_TOKEN) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "TELEGRAM_BOT_TOKEN secret is missing"
            }),
            {
              status: 500,
              headers: {
                "Content-Type": "application/json"
              }
            }
          );
        }

        const bot = createTelegramBot(env, kv);
        const handleUpdate = webhookCallback(bot, "cloudflare-mod");

        return await handleUpdate(request);
      }

      return new Response(
        JSON.stringify({
          success: true,
          service: "HFmanager"
        }),
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    } catch (error) {
      console.error("Worker Error:", error);

      return new Response(
        JSON.stringify({
          success: false,
          error: error?.message || "Unknown error"
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }
  }
};