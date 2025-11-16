export const RelationType = {
  PARENT: 'parent', // from parent to child
  CHILD: 'child', // from child to parent
  SIBLING: 'sibling',
  SPOUSE: 'spouse'
};

export const SpouseRelationType = {
  MARRIED: 'married',
  UNMARRIED: 'unmarried'
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

export class Relationship {
  constructor(data = {}) {
    this.id = data.id || generateUUID();
    this.fromPersonId = data.fromPersonId;
    this.toPersonId = data.toPersonId;
    this.type = data.type; // RelationType
    
    // For spouse relationships
    this.spouseType = data.spouseType || null; // SpouseRelationType
    this.startDate = data.startDate || null; // ISO date string
    this.endDate = data.endDate || null; // ISO date string
    this.color = data.color || this.generateColor(); // Hex color
    
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  generateColor() {
    // Generate a random color for relationships
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
      '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  toJSON() {
    return {
      id: this.id,
      fromPersonId: this.fromPersonId,
      toPersonId: this.toPersonId,
      type: this.type,
      spouseType: this.spouseType,
      startDate: this.startDate,
      endDate: this.endDate,
      color: this.color,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static fromJSON(json) {
    return new Relationship(json);
  }
}