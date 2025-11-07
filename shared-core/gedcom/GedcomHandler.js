import { Person, Relationship, RelationType, SpouseRelationType } from '../models/index.js';

export class GedcomHandler {
  // Export family tree data to GEDCOM format
  static export(persons, relationships) {
  let gedcom = '0 HEAD\n';
  gedcom += '1 SOUR thefamilytreeapp.com\n';
  gedcom += '1 GEDC\n';
  gedcom += '2 VERS 5.5.1\n';
  gedcom += '2 FORM LINEAGE-LINKED\n';
  gedcom += '1 CHAR UTF-8\n';

  // Create person ID map
  const personIdMap = new Map();
  persons.forEach((person, index) => {
    personIdMap.set(person.id, `I${index + 1}`);
  });

  // Add individuals
  persons.forEach((person, index) => {
    gedcom += `0 @I${index + 1}@ INDI\n`;
    if (person.firstName || person.lastName) {
      gedcom += `1 NAME ${person.firstName} /${person.lastName}/\n`;
    }
    if (person.birthDate) {
      gedcom += `1 BIRT\n`;
      gedcom += `2 DATE ${person.birthDate}\n`;
    }
    if (person.deathDate) {
      gedcom += `1 DEAT\n`;
      gedcom += `2 DATE ${person.deathDate}\n`;
    }
    gedcom += `1 NOTE @${person.id}@\n`;
  });

  // Add families (spouse relationships)
  const spouseRelationships = relationships.filter(r => r.type === 'spouse');
  spouseRelationships.forEach((rel, index) => {
    gedcom += `0 @F${index + 1}@ FAM\n`;
    gedcom += `1 HUSB @${personIdMap.get(rel.fromPersonId)}@\n`;
    gedcom += `1 WIFE @${personIdMap.get(rel.toPersonId)}@\n`;
    
    if (rel.startDate) {
      gedcom += `1 MARR\n`;
      gedcom += `2 DATE ${rel.startDate}\n`;
    }
    if (rel.endDate) {
      gedcom += `1 DIV\n`;
      gedcom += `2 DATE ${rel.endDate}\n`;
    }
    if (rel.spouseType) {
      gedcom += `1 NOTE Type: ${rel.spouseType}\n`;
    }
  });

  gedcom += '0 TRLR\n';
  return gedcom;
}

  // Import GEDCOM format to family tree data
  static import(gedcomText) {
    const lines = gedcomText.split('\n');
    const persons = [];
    const relationships = [];
    
    let currentPerson = null;
    let currentTag = null;

    for (const line of lines) {
      const match = line.match(/^(\d+)\s+(@\w+@\s+)?(\w+)(\s+(.*))?$/);
      if (!match) continue;

      const [, level, id, tag, , value] = match;

      if (level === '0' && tag === 'INDI') {
        if (currentPerson) {
          persons.push(new Person(currentPerson));
        }
        currentPerson = {
          id: crypto.randomUUID(),
          firstName: '',
          lastName: ''
        };
        currentTag = null;
      } else if (currentPerson) {
        if (level === '1') {
          currentTag = tag;
          if (tag === 'NAME' && value) {
            const nameParts = value.match(/([^/]*)\s*\/([^/]*)\//);
            if (nameParts) {
              currentPerson.firstName = nameParts[1].trim();
              currentPerson.lastName = nameParts[2].trim();
            }
          }
        } else if (level === '2' && tag === 'DATE') {
          if (currentTag === 'BIRT') {
            currentPerson.birthDate = value;
          } else if (currentTag === 'DEAT') {
            currentPerson.deathDate = value;
          }
        }
      }
    }

    if (currentPerson) {
      persons.push(new Person(currentPerson));
    }

    // TODO: Parse family relationships (FAM records)
    // This is a basic implementation - full GEDCOM support needs more work

    return { persons, relationships };
  }
}
