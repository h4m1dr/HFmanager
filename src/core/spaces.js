// HFmanager - Core Space Manager
// Responsible for checking, waking, and monitoring HuggingFace Spaces

export class SpaceManager {
  constructor(kv) {
    this.kv = kv;
  }

  // =========================
  // Get all spaces
  // =========================
  async listSpaces() {
    return await this.kv.getSpaces();
  }

  // =========================
  // Simple health check (ping)
  // =========================
  async pingSpace(space) {
    try {
      const res = await fetch(space.url, {
        method: "GET",
        headers: {
          "User-Agent": "HFmanager-bot"
        }
      });

      const isOk = res.status >= 200 && res.status < 500;

      await this.kv.updateStatus(
        space.name,
        isOk ? "active" : "error"
      );

      return {
        name: space.name,
        status: isOk ? "active" : "error",
        http: res.status
      };

    } catch (err) {
      await this.kv.updateStatus(space.name, "offline");

      return {
        name: space.name,
        status: "offline",
        error: err.message
      };
    }
  }

  // =========================
  // Wake a Space (force trigger)
  // =========================
  async wakeSpace(space) {
    try {
      // first lightweight ping
      const res = await fetch(space.url, {
        method: "GET"
      });

      const status = res.ok ? "woken" : "failed";

      await this.kv.updateStatus(space.name, status);

      return {
        name: space.name,
        status,
        http: res.status
      };

    } catch (err) {
      await this.kv.updateStatus(space.name, "offline");

      return {
        name: space.name,
        status: "offline",
        error: err.message
      };
    }
  }

  // =========================
  // Check all spaces
  // =========================
  async checkAll() {
    const spaces = await this.kv.getSpaces();

    const results = [];

    for (const space of spaces) {
      const result = await this.pingSpace(space);
      results.push(result);
    }

    return results;
  }

  // =========================
  // Wake all spaces (manual trigger)
  // =========================
  async wakeAll() {
    const spaces = await this.kv.getSpaces();

    const results = [];

    for (const space of spaces) {
      const result = await this.wakeSpace(space);
      results.push(result);
    }

    return results;
  }

  // =========================
  // Get summary report
  // =========================
  async getReport() {
    const spaces = await this.kv.getSpaces();

    const report = {
      total: spaces.length,
      active: 0,
      error: 0,
      offline: 0
    };

    for (const s of spaces) {
      if (s.status === "active") report.active++;
      else if (s.status === "error") report.error++;
      else report.offline++;
    }

    return report;
  }
}