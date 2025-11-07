// Abstract database interface
export class DatabaseInterface {
  async init() {
    throw new Error('Not implemented');
  }

  // Person operations
  async createPerson(person) {
    throw new Error('Not implemented');
  }

  async getPerson(id) {
    throw new Error('Not implemented');
  }

  async getAllPersons() {
    throw new Error('Not implemented');
  }

  async updatePerson(person) {
    throw new Error('Not implemented');
  }

  async deletePerson(id) {
    throw new Error('Not implemented');
  }

  // Relationship operations
  async createRelationship(relationship) {
    throw new Error('Not implemented');
  }

  async getRelationship(id) {
    throw new Error('Not implemented');
  }

  async getAllRelationships() {
    throw new Error('Not implemented');
  }

  async getRelationshipsForPerson(personId) {
    throw new Error('Not implemented');
  }

  async updateRelationship(relationship) {
    throw new Error('Not implemented');
  }

  async deleteRelationship(id) {
    throw new Error('Not implemented');
  }

  // Bulk operations
  async exportAll() {
    const persons = await this.getAllPersons();
    const relationships = await this.getAllRelationships();
    return { persons, relationships };
  }

  async importAll(data) {
    // Clear existing data
    const persons = await this.getAllPersons();
    for (const person of persons) {
      await this.deletePerson(person.id);
    }
    
    const relationships = await this.getAllRelationships();
    for (const rel of relationships) {
      await this.deleteRelationship(rel.id);
    }

    // Import new data
    for (const person of data.persons || []) {
      await this.createPerson(person);
    }
    
    for (const relationship of data.relationships || []) {
      await this.createRelationship(relationship);
    }
  }
}
