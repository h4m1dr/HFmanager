// KV Wrapper for HFmanager
// Simple and clean interface for Cloudflare KV storage

export class KVStore {
  constructor(kv) {
    this.kv = kv;
    this.KEY = {
      SPACES: "spaces_list"
    };
  }

  // =========================
  // Get all spaces
  // =========================
  async getSpaces() {
    const data = await this.kv.get(this.KEY.SPACES, { type: "json" });
    return data || [];
  }

  // =========================
  // Save all spaces
  // =========================
  async saveSpaces(spaces) {
    await this.kv.put(this.KEY.SPACES, JSON.stringify(spaces));
  }

  // =========================
  // Add new space
  // =========================
  async addSpace(name, url, accountId = null) {
    const spaces = await this.getSpaces();

    const exists = spaces.find(s => s.name === name);
    if (exists) {
      throw new Error("Space already exists");
    }

    spaces.push({
      name,
      url,
      accountId,
      status: "registered",
      last_ping: null,
      last_status: null,
      created_at: Date.now()
    });

    await this.saveSpaces(spaces);

    return spaces;
  }

  // =========================
  // Update space status
  // =========================
  async updateStatus(name, status) {
    const spaces = await this.getSpaces();

    const space = spaces.find(s => s.name === name);
    if (!space) {
      throw new Error("Space not found");
    }

    space.status = status;
    space.last_ping = Date.now();

    await this.saveSpaces(spaces);

    return space;
  }

  // =========================
  // Get single space
  // =========================
  async getSpace(name) {
    const spaces = await this.getSpaces();
    return spaces.find(s => s.name === name);
  }

  // =========================
  // Delete space
  // =========================
  async deleteSpace(name) {
    let spaces = await this.getSpaces();

    const before = spaces.length;
    spaces = spaces.filter(s => s.name !== name);

    if (spaces.length === before) {
      throw new Error("Space not found");
    }

    await this.saveSpaces(spaces);

    return spaces;
  }

  // =========================
  // Ping update helper
  // =========================
  async ping(name) {
    const space = await this.updateStatus(name, "active");
    return space;
  }
}