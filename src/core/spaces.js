export class SpaceManager {
  constructor(kv) {
    this.kv = kv;
    this.prefix = "space:";
  }

  // -------------------------
  // INTERNAL HELPERS
  // -------------------------
  _key(id) {
    return `${this.prefix}${id}`;
  }

  _safeParse(data) {
    try {
      return typeof data === "string" ? JSON.parse(data) : data;
    } catch {
      return null;
    }
  }

  // -------------------------
  // GET ALL SPACES
  // -------------------------
  async getAll() {
    const res = await this.kv.list(this.prefix);

    const spaces = [];

    for (const key of res.keys || []) {
      const data = await this.kv.get(key.name);

      const parsed = this._safeParse(data);
      if (parsed) spaces.push(parsed);
    }

    return spaces;
  }

  // -------------------------
  // GET SINGLE SPACE
  // -------------------------
  async get(id) {
    const data = await this.kv.get(this._key(id));
    return this._safeParse(data);
  }

  // -------------------------
  // ADD SPACE (WITH VALIDATION)
  // -------------------------
  async add(space) {
    if (!space?.id || !space?.name || !space?.url) {
      throw new Error("Invalid space object");
    }

    const payload = {
      id: space.id,
      name: space.name,
      url: space.url,
      status: "unknown",
      lastCheck: null,
      lastWake: null
    };

    await this.kv.set(this._key(space.id), payload);

    return payload;
  }

  // -------------------------
  // REMOVE SPACE
  // -------------------------
  async remove(id) {
    return await this.kv.delete(this._key(id));
  }

  // -------------------------
  // REALISTIC WAKE (HTTP CHECK)
  // -------------------------
  async wake(id) {
    const space = await this.get(id);

    if (!space) return null;

    try {
      const start = Date.now();

      const res = await fetch(space.url, {
        method: "GET",
        signal: AbortSignal.timeout(8000)
      });

      const latency = Date.now() - start;

      space.status = res.ok ? "online" : "offline";
      space.lastWake = Date.now();
      space.latency = latency;
      space.httpStatus = res.status;

      await this.kv.set(this._key(id), space);

      return space;
    } catch (err) {
      space.status = "offline";
      space.lastWake = Date.now();
      space.error = err?.message || "fetch failed";

      await this.kv.set(this._key(id), space);

      return space;
    }
  }

  // -------------------------
  // REPORT
  // -------------------------
  async getReport() {
    const spaces = await this.getAll();

    return {
      status: "online",
      totalSpaces: spaces.length,
      online: spaces.filter(s => s.status === "online").length,
      offline: spaces.filter(s => s.status !== "online").length,
      timestamp: Date.now()
    };
  }

  // -------------------------
  // WAKE ALL (SAFE PARALLEL)
  // -------------------------
  async wakeAll() {
    const spaces = await this.getAll();

    const results = await Promise.allSettled(
      spaces.map(s => this.wake(s.id))
    );

    return {
      success: true,
      triggered: spaces.length,
      results: results.map(r => ({
        ok: r.status === "fulfilled",
        value: r.value || null
      }))
    };
  }
}