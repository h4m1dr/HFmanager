export class KVStore {
  constructor(kv) {
    this.kv = kv;
  }

  async get(key) {
    return await this.kv.get(key, "json");
  }

  async set(key, value) {
    return await this.kv.put(key, JSON.stringify(value));
  }

  async delete(key) {
    return await this.kv.delete(key);
  }

  async list(prefix = "") {
    return await this.kv.list({ prefix });
  }
}