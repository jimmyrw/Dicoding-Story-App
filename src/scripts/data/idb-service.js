// src/scripts/data/idb-service.js
import { openDB } from 'idb';
import CONFIG from '../config';

const DB_NAME = CONFIG.DATABASE_NAME;
const DB_VERSION = CONFIG.DATABASE_VERSION;
const OBJECT_STORE_NAME = CONFIG.OBJECT_STORE_NAME;
const FAVORITE_STORE_NAME = 'favorite-stories';

const IdbService = {
  async getDb() {
    return openDB(DB_NAME, DB_VERSION, {
      upgrade(database) {
        // Buat object store jika belum ada
        if (!database.objectStoreNames.contains(OBJECT_STORE_NAME)) {
          database.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
        }
        if (!database.objectStoreNames.contains(FAVORITE_STORE_NAME)) {
          database.createObjectStore(FAVORITE_STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  },

  // Stories operations
  async getAllStories() {
    const db = await this.getDb();
    return db.getAll(OBJECT_STORE_NAME);
  },

  async getStory(id) {
    const db = await this.getDb();
    return db.get(OBJECT_STORE_NAME, id);
  },

  async saveStories(stories) {
    const db = await this.getDb();
    const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
    
    // Save each story
    await Promise.all(
      stories.map((story) => tx.store.put(story))
    );
    
    await tx.done;
  },

  async saveStory(story) {
    const db = await this.getDb();
    return db.put(OBJECT_STORE_NAME, story);
  },

  async deleteStory(id) {
    const db = await this.getDb();
    return db.delete(OBJECT_STORE_NAME, id);
  },

  // Favorite stories operations
  async getAllFavorites() {
    const db = await this.getDb();
    return db.getAll(FAVORITE_STORE_NAME);
  },

  async getFavorite(id) {
    const db = await this.getDb();
    return db.get(FAVORITE_STORE_NAME, id);
  },

  async saveFavorite(story) {
    const db = await this.getDb();
    return db.put(FAVORITE_STORE_NAME, story);
  },

  async deleteFavorite(id) {
    const db = await this.getDb();
    return db.delete(FAVORITE_STORE_NAME, id);
  },

  async isFavorite(id) {
    const favorite = await this.getFavorite(id);
    return !!favorite;
  },
};

export default IdbService;