# 🚀 HFmanager — Telegram Bot + Cloudflare Worker Dashboard

HFmanager is a lightweight **Telegram-controlled management system** running on **Cloudflare Workers**.

It provides a simple UI inside Telegram to manage Spaces/Instances.

---

# 🧠 Architecture

```text
Telegram Bot (UI)
        ↓ webhook
Cloudflare Worker (Backend API)
        ↓
Cloudflare KV (State Storage)
````

---

# ⚙️ Full Setup (ZERO CONFUSION VERSION)

## 1️⃣ Clone project

```bash
git clone https://github.com/h4m1dr/HFmanager
cd HFmanager
```

---

## 2️⃣ Install dependencies

```bash
npm install
```

---

## 3️⃣ Configure wrangler

Edit:

```text
wrangler.toml
```

```toml
name = "hfmanager"
main = "src/index.js"
compatibility_date = "2026-06-19"

compatibility_flags = ["nodejs_compat"]

kv_namespaces = [
  { binding = "HF_SPACES_KV", id = "YOUR_KV_ID" }
]
```

---

## 4️⃣ Create KV (if not created)

```bash
wrangler kv namespace create HF_SPACES_KV
```

Copy ID into `wrangler.toml`

---

## 5️⃣ Set secrets

```bash
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put ADMIN_ID
```

---

# 🚀 6️⃣ Deploy (ONE COMMAND)

```bash
wrangler deploy
```

You will get:

```text
https://hfmanager.<subdomain>.workers.dev
```

---

# 🤖 7️⃣ AUTO WEBHOOK SETUP (IMPORTANT)

After deploy, run:

```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://hfmanager.<subdomain>.workers.dev/webhook"
```

---

# 🔁 8️⃣ VERIFY WEBHOOK

```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

You must see:

```json
"url": "https://hfmanager.../webhook"
```

---

# 📱 9️⃣ Test Bot

Open Telegram:

```text
/start
```

---

# 🧠 Expected Behavior

* Bot responds with dashboard
* Spaces list shows
* Wake / Add works
* No errors in wrangler tail

---

# 🔐 Security Model

* Tokens stored ONLY in Cloudflare secrets
* No `.env` in repo
* No exposed credentials
* Webhook-only communication

---

# 🧪 Debug Mode

If something fails:

```bash
wrangler tail
```

---

# 🚨 Common Issues

### ❌ Bot not responding

→ webhook not set to `/webhook`

### ❌ 500 error

→ missing KV binding

### ❌ Access denied

→ ADMIN_ID mismatch

---

# 🔁 Dev Workflow

```text
edit code
git commit
git push
wrangler deploy
test in Telegram
```

---

# ⚡ Quick Links

Bot:

```
https://t.me/<YOUR_BOT_USERNAME>
```

Worker:

```
https://hfmanager.<subdomain>.workers.dev
```

---

# 🔥 Summary

* Telegram = UI layer
* Cloudflare Worker = backend
* KV = storage
* Wrangler = deploy tool
* Webhook = `/webhook` endpoint ONLY

---

# 🚀 Next upgrades (optional)

If you want next version:

* multi-user system
* real admin panel
* analytics dashboard
* job queue system
* auto healing (self restart spaces)
