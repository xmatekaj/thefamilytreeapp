import { DatabaseInterface } from './DatabaseInterface.js';
import { Person, Relationship } from '../models/index.js';

// This will call Tauri commands to interact with SQLite
export class SQLiteDatabase extends DatabaseInterface {
  constructor() {
    super();
    this.invoke = null; // Will be set from Tauri
  }

  setInvoke(invokeFn) {
    this.invoke = invokeFn;
  }

  async init() {
    if (!this.invoke) {
      throw new Error('Tauri invoke function not set');
    }
    await this.invoke('init_database');
  }

  async createPerson(person) {
    const personObj = person instanceof Person ? person.toJSON() : person;
    const result = await this.invoke('create_person', { person: personObj });
    return Person.fromJSON(result);
  }

  async getPerson(id) {
    const result = await this.invoke('get_person', { id });
    return result ? Person.fromJSON(result) : null;
  }

  async getAllPersons() {
    const results = await this.invoke('get_all_persons');
    return results.map(p => Person.fromJSON(p));
  }

  async updatePerson(person) {
    const personObj = person instanceof Person ? person.toJSON() : person;
    personObj.updatedAt = new Date().toISOString();
    const result = await this.invoke('update_person', { person: personObj });
    return Person.fromJSON(result);
  }

  async deletePerson(id) {
    await this.invoke('delete_person', { id });
  }

  async createRelationship(relationship) {
    const relObj = relationship instanceof Relationship ? relationship.toJSON() : relationship;
    const result = await this.invoke('create_relationship', { relationship: relObj });
    return Relationship.fromJSON(result);
  }

  async getRelationship(id) {
    const result = await this.invoke('get_relationship', { id });
    return result ? Relationship.fromJSON(result) : null;
  }

  async getAllRelationships() {
    const results = await this.invoke('get_all_relationships');
    return results.map(r => Relationship.fromJSON(r));
  }

  async getRelationshipsForPerson(personId) {
    const results = await this.invoke('get_relationships_for_person', { personId });
    return results.map(r => Relationship.fromJSON(r));
  }

  async updateRelationship(relationship) {
    const relObj = relationship instanceof Relationship ? relationship.toJSON() : relationship;
    relObj.updatedAt = new Date().toISOString();
    const result = await this.invoke('update_relationship', { relationship: relObj });
    return Relationship.fromJSON(result);
  }

  async deleteRelationship(id) {
    await this.invoke('delete_relationship', { id });
  }
}
