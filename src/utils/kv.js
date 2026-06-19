export class KVStore {
  constructor(kv) {
    this.kv = kv;
  }

  _ensureKV() {
    if (!this.kv) {
      throw new Error("KV binding is missing or undefined");
    }
  }

  async get(key) {
    try {
      this._ensureKV();
      return await this.kv.get(key, "json");
    } catch (err) {
      console.error("[KV GET ERROR]", key, err);
      return null;
    }
  }

  async set(key, value) {
    try {
      this._ensureKV();

      const safeValue =
        typeof value === "string"
          ? value
          : JSON.stringify(value);

      return await this.kv.put(key, safeValue);
    } catch (err) {
      console.error("[KV SET ERROR]", key, err);
      throw err;
    }
  }

  async delete(key) {
    try {
      this._ensureKV();
      return await this.kv.delete(key);
    } catch (err) {
      console.error("[KV DELETE ERROR]", key, err);
      return false;
    }
  }

  async list(prefix = "") {
    try {
      this._ensureKV();
      return await this.kv.list({ prefix });
    } catch (err) {
      console.error("[KV LIST ERROR]", prefix, err);
      return { keys: [] };
    }
  }
}