import { IndexedDBDatabase, SQLiteDatabase } from '@familytree/shared-core';

class DatabaseService {
  constructor() {
    this.db = null;
    this.isTauri = false;
  }

  async init() {
    // Check if running in Tauri
    this.isTauri = typeof window !== 'undefined' && window.__TAURI__;

    console.log('Initializing database, isTauri:', this.isTauri);

    if (this.isTauri) {
      // Tauri 2.x uses @tauri-apps/api/core instead of @tauri-apps/api/tauri
      const { invoke } = await import('@tauri-apps/api/core');
      this.db = new SQLiteDatabase();
      this.db.setInvoke(invoke);
    } else {
      console.log('Using IndexedDB');
      this.db = new IndexedDBDatabase();
    }

    await this.db.init();
    console.log('Database initialized successfully');
  }

  getDatabase() {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }
}

export const dbService = new DatabaseService();