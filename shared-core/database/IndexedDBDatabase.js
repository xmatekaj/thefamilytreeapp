import { DatabaseInterface } from './DatabaseInterface.js';
import { Person, Relationship } from '../models/index.js';

export class IndexedDBDatabase extends DatabaseInterface {
  constructor(dbName = 'FamilyTreeDB') {
    super();
    this.dbName = dbName;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('persons')) {
          db.createObjectStore('persons', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('relationships')) {
          db.createObjectStore('relationships', { keyPath: 'id' });
        }
      };
    });
  }

  async createPerson(person) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['persons'], 'readwrite');
      const store = tx.objectStore('persons');
      const personObj = person instanceof Person ? person.toJSON() : person;
      const request = store.add(personObj);
      request.onsuccess = () => resolve(Person.fromJSON(personObj));
      request.onerror = () => reject(request.error);
    });
  }

  async getPerson(id) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['persons'], 'readonly');
      const store = tx.objectStore('persons');
      const request = store.get(id);
      request.onsuccess = () => {
        const data = request.result;
        resolve(data ? Person.fromJSON(data) : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllPersons() {
    if (!this.db) {
      console.error('Database not initialized in getAllPersons');
      return [];
    }
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['persons'], 'readonly');
      const store = tx.objectStore('persons');
      const request = store.getAll();
      request.onsuccess = () => {
        const data = request.result;
        resolve(data.map(p => Person.fromJSON(p)));
      };
      request.onerror = () => reject(request.error);
    });
  }

  async updatePerson(person) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['persons'], 'readwrite');
      const store = tx.objectStore('persons');
      const personObj = person instanceof Person ? person.toJSON() : person;
      personObj.updatedAt = new Date().toISOString();
      const request = store.put(personObj);
      request.onsuccess = () => resolve(Person.fromJSON(personObj));
      request.onerror = () => reject(request.error);
    });
  }

  async deletePerson(id) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['persons'], 'readwrite');
      const store = tx.objectStore('persons');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async createRelationship(relationship) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['relationships'], 'readwrite');
      const store = tx.objectStore('relationships');
      const relObj = relationship instanceof Relationship ? relationship.toJSON() : relationship;
      const request = store.add(relObj);
      request.onsuccess = () => resolve(Relationship.fromJSON(relObj));
      request.onerror = () => reject(request.error);
    });
  }

  async getRelationship(id) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['relationships'], 'readonly');
      const store = tx.objectStore('relationships');
      const request = store.get(id);
      request.onsuccess = () => {
        const data = request.result;
        resolve(data ? Relationship.fromJSON(data) : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllRelationships() {
    if (!this.db) {
      console.error('Database not initialized in getAllRelationships');
      return [];
    }
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['relationships'], 'readonly');
      const store = tx.objectStore('relationships');
      const request = store.getAll();
      request.onsuccess = () => {
        const data = request.result;
        resolve(data.map(r => Relationship.fromJSON(r)));
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getRelationshipsForPerson(personId) {
    const all = await this.getAllRelationships();
    return all.filter(r => r.fromPersonId === personId || r.toPersonId === personId);
  }

  async updateRelationship(relationship) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['relationships'], 'readwrite');
      const store = tx.objectStore('relationships');
      const relObj = relationship instanceof Relationship ? relationship.toJSON() : relationship;
      relObj.updatedAt = new Date().toISOString();
      const request = store.put(relObj);
      request.onsuccess = () => resolve(Relationship.fromJSON(relObj));
      request.onerror = () => reject(request.error);
    });
  }

  async deleteRelationship(id) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['relationships'], 'readwrite');
      const store = tx.objectStore('relationships');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
