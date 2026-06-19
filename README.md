# 🚀 HFmanager — Telegram Bot + Cloudflare Worker Dashboard

HFmanager is a lightweight system for managing **Spaces / Instances / Jobs** through a **Telegram-based UI**, powered by **Cloudflare Workers**.

It is designed to be:

* ⚡ Fast
* ☁️ Serverless
* 📱 Telegram-native UI
* 🔐 Secure (no exposed secrets)

---

# 🧠 Project Overview

HFmanager works like this:

```text id="arch"
Telegram Bot (UI)
        ↓ webhook
Cloudflare Worker (backend API)
        ↓
Optional KV storage (state/data)
```

* Telegram = user interface
* Worker = backend logic
* Cloudflare = runtime

---

# ⚙️ Deployment (ONLY METHOD YOU NEED)

> This is the **single standard way** to run the project:
> Clone → Configure → Deploy to Cloudflare

---

# 1️⃣ Clone the Repository

```bash id="c1"
git clone https://github.com/USERNAME/HFmanager.git
cd HFmanager
```

---

# 2️⃣ Install Dependencies

```bash id="c2"
npm install
```

---

# 3️⃣ Configure Project

Create or edit:

```text id="c3"
wrangler.toml
```

```toml id="c4"
name = "hfmanager"
main = "src/index.js"
compatibility_date = "2026-06-19"
```

---

# 4️⃣ Login to Cloudflare

```bash id="c5"
npm install -g wrangler
wrangler login
```

---

# 5️⃣ Add Telegram Bot Secret (IMPORTANT)

Never put tokens in code or GitHub.

```bash id="c6"
wrangler secret put TELEGRAM_BOT_TOKEN
```

Paste your token:

```text id="c7"
123456:ABCDEF_your_bot_token_here
```

---

# 6️⃣ Deploy to Cloudflare

```bash id="c8"
wrangler deploy
```

After deployment, you will get:

```text id="c9"
https://hfmanager.<your-subdomain>.workers.dev
```

---

# 🔗 7️⃣ Connect Telegram Bot (Webhook)

Now link Telegram to your Worker:

```bash id="c10"
https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://hfmanager.<your-subdomain>.workers.dev
```

Example:

```bash id="c11"
https://api.telegram.org/bot123456:ABC/setWebhook?url=https://hfmanager.workers.dev
```

---

# 📱 8️⃣ Test the Bot

Open Telegram and send:

```text id="c12"
/start
```

If everything is correct, you will see:

```text id="c13"
🧠 HFmanager Dashboard

📊 Status: Online
📡 Spaces: 0

[📊 Status] [📡 Spaces]
[➕ Add] [⚙ Settings]
```

---

# 🧩 What this project does

HFmanager is a control panel for:

* Creating and managing “Spaces”
* Tracking instances/jobs
* Simple admin actions through Telegram UI
* Lightweight orchestration layer on Cloudflare Workers

---

# 🔐 Security Model

* ❌ No tokens in GitHub
* ❌ No server required
* ✅ Secrets stored in Cloudflare (`wrangler secret`)
* ✅ Telegram communicates via webhook only

---

# 🔁 Development Workflow

```text id="c14"
edit code
   ↓
git commit
   ↓
git push
   ↓
wrangler deploy
   ↓
test in Telegram (/start)
```

---

# 🚫 .gitignore

```gitignore id="c15"
node_modules
.env
.wrangler
dist
```

---

# ⚡ Quick Access

Your bot link:

```text id="c16"
https://t.me/<YOUR_BOT_USERNAME>
```

---

# 🔥 Summary

HFmanager is:

* Telegram = UI layer
* Cloudflare Worker = backend
* Wrangler = deployment tool
* Secrets = secure environment variables

---

If you want next step, I can upgrade this README to:

* 🔥 multi-user SaaS architecture
* 🔥 KV-based dashboard persistence
* 🔥 admin panel (outside Telegram)
* 🔥 full production scaling guide

Just say 👍
