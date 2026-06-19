export class SpaceManager {
  constructor(kv) {
    this.kv = kv;
    this.prefix = "space:";
  }

  async getAll() {
    const res = await this.kv.list(this.prefix);

    const spaces = [];

    for (const key of res.keys) {
      const data = await this.kv.get(key.name);
      if (data) spaces.push(data);
    }

    return spaces;
  }

  async get(id) {
    return await this.kv.get(this.prefix + id);
  }

  async add(space) {
    const key = this.prefix + space.id;
    await this.kv.set(key, space);
    return space;
  }

  async remove(id) {
    return await this.kv.delete(this.prefix + id);
  }

  async wake(id) {
    const space = await this.get(id);

    if (!space) return null;

    space.status = "online";
    space.lastWake = Date.now();

    await this.kv.set(this.prefix + id, space);

    return space;
  }

  async getAllSpaces() {
    return this.getAll();
  }

  async getReport() {
    const spaces = await this.getAll();

    return {
      status: "online",
      totalSpaces: spaces.length,
      online: spaces.filter(s => s.status === "online").length,
      offline: spaces.filter(s => s.status === "offline").length,
      timestamp: Date.now()
    };
  }

  async wakeAll() {
    const spaces = await this.getAll();

    for (const s of spaces) {
      await this.wake(s.id);
    }

    return {
      success: true,
      triggered: spaces.length
    };
  }
}