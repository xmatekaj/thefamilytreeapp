export const Gender = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other'
};

// Simple UUID v4 generator fallback
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback UUID generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export class Person {
  constructor(data = {}) {
    this.id = data.id || generateUUID();
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.birthDate = data.birthDate || null;
    this.deathDate = data.deathDate || null;
    this.photo = data.photo || null;
    this.gender = data.gender || null; // Gender.MALE, Gender.FEMALE, Gender.OTHER
    this.generation = data.generation || 0;
    this.positionX = data.positionX !== undefined ? data.positionX : null;
    this.positionY = data.positionY !== undefined ? data.positionY : null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      birthDate: this.birthDate,
      deathDate: this.deathDate,
      photo: this.photo,
      gender: this.gender,
      generation: this.generation,
      positionX: this.positionX,
      positionY: this.positionY,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromJSON(json) {
    return new Person(json);
  }
}
