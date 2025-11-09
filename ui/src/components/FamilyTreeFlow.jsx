import { useCallback, useState, useEffect, useRef } from 'react';
import { getTranslation } from '../../../shared-core/i18n/translations.js';
import { LanguageSelector } from './LanguageSelector';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { PersonNode } from './PersonNode';
import { RelationshipEdge } from './RelationshipEdge';
import { PersonEditModal } from './PersonEditModal';
import { RelationshipEditModal } from './RelationshipEditModal';
import { dbService } from '../services/database';
import { Person, Relationship, RelationType, SpouseRelationType } from '@familytree/shared-core';
import { GedcomHandler } from '@familytree/shared-core';

const nodeTypes = {
  person: PersonNode,
};

const edgeTypes = {
  relationship: RelationshipEdge,
};

// Layout constants
const VERTICAL_SPACING = 350; // Space between generations
const HORIZONTAL_SPACING = 250; // Space between people in same generation

export function FamilyTreeFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isDbReady, setIsDbReady] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [pendingRelationship, setPendingRelationship] = useState(null);
  const [selectedRelationship, setSelectedRelationship] = useState(null);
  const [lang, setLang] = useState('en');
  const positionCounterRef = useRef({});
  
  // Create translation function
  const t = (key) => getTranslation(lang, key);

  useEffect(() => {
    initDatabase();
  }, []);

  const initDatabase = async () => {
    try {
      await dbService.init();
      setIsDbReady(true);
      await loadFamilyTree();
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  };

  // Snap Y position to nearest generation layer
  const snapToLayer = (y) => {
    const generation = Math.round((y - 100) / VERTICAL_SPACING);
    return generation * VERTICAL_SPACING + 100;
  };

  // Get generation from Y position
  const getGenerationFromY = (y) => {
    const generation = Math.round((y - 100) / VERTICAL_SPACING);
    return generation;
  };

  // Find empty space for new person
  const findEmptySpace = () => {
    if (nodes.length === 0) {
      return { x: 400, y: 100, generation: 0 };
    }

    for (let gen = 0; gen <= 5; gen++) {
      const nodesInGen = nodes.filter(n => n.data.generation === gen);
      
      if (nodesInGen.length === 0) {
        return { x: 100, y: gen * VERTICAL_SPACING + 100, generation: gen };
      }
      
      const maxX = Math.max(...nodesInGen.map(n => n.position.x));
      const newX = maxX + HORIZONTAL_SPACING;
      
      if (newX < 2000) {
        return { x: newX, y: gen * VERTICAL_SPACING + 100, generation: gen };
      }
    }

    const gen0Nodes = nodes.filter(n => n.data.generation === 0);
    const maxX = gen0Nodes.length > 0 ? Math.max(...gen0Nodes.map(n => n.position.x)) : 0;
    return { x: maxX + HORIZONTAL_SPACING, y: 100, generation: 0 };
  };

  const loadFamilyTree = async () => {
    try {
      console.log('Loading family tree...');
      const db = dbService.getDatabase();
      const persons = await db.getAllPersons();
      const relationships = await db.getAllRelationships();

      console.log('Loaded persons:', persons.length);
      console.log('Loaded relationships:', relationships.length);

      positionCounterRef.current = {};

      const newNodes = persons.map(person => {
        let x, y;
        
        if (person.positionX !== null && person.positionY !== null) {
          x = person.positionX;
          y = person.positionY;
        } else {
          const generation = person.generation || 0;
          x = 100;
          y = generation * VERTICAL_SPACING + 100;
        }
        
        return {
          id: person.id,
          type: 'person',
          position: { x, y },
          data: {
            firstName: person.firstName,
            lastName: person.lastName,
            birthDate: person.birthDate,
            deathDate: person.deathDate,
            photo: person.photo,
            gender: person.gender,
            generation: person.generation || 0,
          },
          draggable: true,
        };
      });

      const newEdges = relationships.map(rel => {
        let sourceHandle = 'child';
        let targetHandle = 'parent';
        let animated = false;
        let label = '';
        
        if (rel.type === RelationType.SPOUSE) {
          sourceHandle = 'spouse-right';
          targetHandle = 'spouse-left';
          animated = true;
          
          if (rel.spouseType === SpouseRelationType.MARRIED) {
            label = `Marriage`;
          } else if (rel.spouseType === SpouseRelationType.UNMARRIED) {
            label = `Relationship`;
          } else {
            label = `Spouse`;
          }
                   
          if (rel.startDate) {
            label += ` (${rel.startDate}`;
            if (rel.endDate) {
              label += ` - ${rel.endDate})`;
            } else {
              label += ` - present)`;
            }
          }
        } else if (rel.type === RelationType.PARENT) {
          sourceHandle = 'child';
          targetHandle = 'parent';
          label = '';
        } else if (rel.type === RelationType.SIBLING) {
          sourceHandle = 'spouse-right';
          targetHandle = 'spouse-left';
        }

        return {
          id: rel.id,
          source: rel.fromPersonId,
          target: rel.toPersonId,
          sourceHandle,
          targetHandle,
          type: 'relationship',
          animated,
          data: {
            label,
            color: rel.color,
            onDelete: handleDeleteRelationship,
            spouseType: rel.spouseType,
            startDate: rel.startDate,
            endDate: rel.endDate,
            relType: rel.type,
          },
        };
      });
      
      const validNodeIds = new Set(newNodes.map(n => n.id));
      const validEdges = newEdges.filter(e => 
        validNodeIds.has(e.source) && validNodeIds.has(e.target)
      );

      setNodes(newNodes);
      setEdges(validEdges);
      console.log('Family tree loaded successfully');
    } catch (error) {
      console.error('Failed to load family tree:', error);
    }
  };

  const getRelationshipLabel = (type) => {
    const labels = {
      [RelationType.PARENT]: 'Parent',
      [RelationType.CHILD]: 'Child',
      [RelationType.SIBLING]: 'Sibling',
      [RelationType.SPOUSE]: 'Spouse',
    };
    return labels[type] || type;
  };

  const isValidConnection = useCallback((connection) => {
    console.log('Validating connection:', connection);
    
    if (connection.source === connection.target) {
      console.log('Cannot connect to self');
      return false;
    }
    
    console.log('Connection valid');
    return true;
  }, []);

  // IMPORTANT: Define handleDeleteRelationship BEFORE onConnect
  const handleDeleteRelationship = async (relationshipId) => {
    if (!confirm('Are you sure you want to delete this relationship?')) {
      return;
    }
    
    try {
      const db = dbService.getDatabase();
      await db.deleteRelationship(relationshipId);
      
      setEdges((eds) => eds.filter(e => e.id !== relationshipId));
      setPendingRelationship(null);
      setSelectedRelationship(null);
    } catch (error) {
      console.error('Failed to delete relationship:', error);
      alert('Failed to delete relationship: ' + error.message);
    }
  };

  const onConnect = useCallback(
    async (params) => {
      try {
        console.log('=== Connection Created ===');
        console.log('Source:', params.source);
        console.log('Target:', params.target);
        console.log('Source Handle:', params.sourceHandle);
        console.log('Target Handle:', params.targetHandle);
        
        const db = dbService.getDatabase();
        
        let relType = RelationType.PARENT;
        
        const sourceIsSpouse = params.sourceHandle?.includes('spouse');
        const targetIsSpouse = params.targetHandle?.includes('spouse');
        const isSpouseConnection = sourceIsSpouse && targetIsSpouse;
        
        if (params.sourceHandle === 'child' && params.targetHandle === 'parent') {
          relType = RelationType.PARENT;
          console.log('-> Parent-child connection');
        } else if (isSpouseConnection) {
          relType = RelationType.SPOUSE;
          console.log('-> SPOUSE CONNECTION DETECTED!');
        } else {
          relType = RelationType.PARENT;
          console.log('-> Default parent connection');
        }
        
        const relationship = new Relationship({
          fromPersonId: params.source,
          toPersonId: params.target,
          type: relType,
          spouseType: relType === RelationType.SPOUSE ? SpouseRelationType.MARRIED : null,
        });
        
        await db.createRelationship(relationship);
        console.log('Relationship saved to database');
        
        if (relType === RelationType.SPOUSE) {
          const edge = {
            id: relationship.id,
            source: params.source,
            target: params.target,
            sourceHandle: params.sourceHandle,
            targetHandle: params.targetHandle,
            type: 'relationship',
            animated: true,
            data: {
              label: 'Marriage #1',
              color: relationship.color,
              onDelete: handleDeleteRelationship,
              spouseType: SpouseRelationType.MARRIED,
              startDate: null,
              endDate: null,
              relType: RelationType.SPOUSE,
            },
          };
          
          setEdges((eds) => [...eds, edge]);
          
          setPendingRelationship({
            id: relationship.id,
            edge: edge,
          });
        } else {
          setEdges((eds) => [...eds, {
            id: relationship.id,
            source: params.source,
            target: params.target,
            sourceHandle: params.sourceHandle,
            targetHandle: params.targetHandle,
            type: 'relationship',
            animated: false,
            data: {
              label: '',
              onDelete: handleDeleteRelationship,
              color: relationship.color,
              relType: relType,
            },
          }]);
        }
      } catch (error) {
        console.error('Failed to create relationship:', error);
        alert('Failed to create relationship: ' + error.message);
      }
    },
    [setEdges]
  );

  const addPerson = async () => {
    try {
      console.log('Adding new person...');
      const db = dbService.getDatabase();
      
      const position = findEmptySpace();
      
      const person = new Person({
        firstName: t('newPerson'),  // Changed from 'New'
        lastName: '',               // Changed from 'Person'
        generation: position.generation,
        positionX: position.x,
        positionY: position.y,
      });
      
      await db.createPerson(person);
      
      setNodes((nds) => [...nds, {
        id: person.id,
        type: 'person',
        position: { x: position.x, y: position.y },
        data: {
          firstName: person.firstName,
          lastName: person.lastName,
          birthDate: person.birthDate,
          deathDate: person.deathDate,
          photo: person.photo,
          gender: person.gender,
          generation: person.generation,
        },
        draggable: true,
      }]);
      
      console.log('Person added at', position);
    } catch (error) {
      console.error('Failed to add person:', error);
      alert('Failed to add person: ' + error.message);
    }
  };


  const clearDatabase = async () => {
    if (!confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      return;
    }
    
    try {
      const db = dbService.getDatabase();
      const persons = await db.getAllPersons();
      const relationships = await db.getAllRelationships();
      
      for (const rel of relationships) {
        await db.deleteRelationship(rel.id);
      }
      
      for (const person of persons) {
        await db.deletePerson(person.id);
      }
      
      positionCounterRef.current = {};
      setNodes([]);
      setEdges([]);
      alert('Database cleared successfully');
    } catch (error) {
      console.error('Failed to clear database:', error);
      alert('Failed to clear database: ' + error.message);
    }
  };

  const exportJSON = async () => {
    try {
      const db = dbService.getDatabase();
      const data = await db.exportAll();
      
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `family-tree-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export JSON:', error);
      alert('Failed to export: ' + error.message);
    }
  };

  const importJSON = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
      
      const text = await file.text();
      const data = JSON.parse(text);
      
      const db = dbService.getDatabase();
      await db.importAll(data);
      
      await loadFamilyTree();
      alert('Import successful!');
      event.target.value = '';
    } catch (error) {
      console.error('Failed to import JSON:', error);
      alert('Failed to import: ' + error.message);
    }
  };

  const exportGEDCOM = async () => {
    try {
      const db = dbService.getDatabase();
      const persons = await db.getAllPersons();
      const relationships = await db.getAllRelationships();
      
      const gedcom = GedcomHandler.export(persons, relationships);
      
      const blob = new Blob([gedcom], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `family-tree-${new Date().toISOString().split('T')[0]}.ged`;
      a.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export GEDCOM:', error);
      alert('Failed to export GEDCOM: ' + error.message);
    }
  };

  const importGEDCOM = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
      
      const text = await file.text();
      const data = GedcomHandler.import(text);
      
      const db = dbService.getDatabase();
      await db.importAll(data);
      
      await loadFamilyTree();
      alert('GEDCOM import successful!');
      event.target.value = '';
    } catch (error) {
      console.error('Failed to import GEDCOM:', error);
      alert('Failed to import GEDCOM: ' + error.message);
    }
  };

  const onNodeClick = useCallback((event, node) => {
    setSelectedPerson(node);
  }, []);

  const onEdgeClick = useCallback((event, edge) => {
    if (edge.data?.relType === RelationType.SPOUSE) {
      setSelectedRelationship(edge);
    }
  }, []);

  const handleSavePerson = async (formData) => {
    try {
      const db = dbService.getDatabase();
      const person = await db.getPerson(selectedPerson.id);
      
      person.firstName = formData.firstName;
      person.lastName = formData.lastName;
      person.birthDate = formData.birthDate;
      person.deathDate = formData.deathDate;
      person.photo = formData.photo;
      person.gender = formData.gender;
      
      await db.updatePerson(person);
      setSelectedPerson(null);
      
      setNodes((nds) => nds.map(n => {
        if (n.id === person.id) {
          return {
            ...n,
            data: {
              ...n.data,
              firstName: person.firstName,
              lastName: person.lastName,
              birthDate: person.birthDate,
              deathDate: person.deathDate,
              photo: person.photo,
              gender: person.gender,
            },
          };
        }
        return n;
      }));
    } catch (error) {
      console.error('Failed to save person:', error);
      alert('Failed to save person: ' + error.message);
    }
  };

  const handleDeletePerson = async (personId) => {
    if (!confirm('Are you sure you want to delete this person?')) {
      return;
    }
    
    try {
      const db = dbService.getDatabase();
      
      const relationships = await db.getRelationshipsForPerson(personId);
      for (const rel of relationships) {
        await db.deleteRelationship(rel.id);
      }
      
      await db.deletePerson(personId);
      setSelectedPerson(null);
      
      setNodes((nds) => nds.filter(n => n.id !== personId));
      setEdges((eds) => eds.filter(e => e.source !== personId && e.target !== personId));
    } catch (error) {
      console.error('Failed to delete person:', error);
      alert('Failed to delete person: ' + error.message);
    }
  };

  const handleSaveRelationship = async (formData) => {
    try {
      const db = dbService.getDatabase();
      const relationshipId = pendingRelationship ? pendingRelationship.id : selectedRelationship.id;
      const relationship = await db.getRelationship(relationshipId);
      
      relationship.spouseType = formData.spouseType;
      relationship.startDate = formData.startDate;
      relationship.endDate = formData.endDate;
      
      await db.updateRelationship(relationship);
      
      let label = formData.spouseType === SpouseRelationType.MARRIED ? 'Marriage' : 'Relationship';
      if (formData.startDate) {
        label += ` (${formData.startDate}`;
        if (formData.endDate) {
          label += ` - ${formData.endDate})`;
        } else {
          label += ` - present)`;
        }
      }
      
      setEdges((eds) => eds.map(e => {
        if (e.id === relationshipId) {
          return {
            ...e,
            data: {
              ...e.data,
              label,
              spouseType: formData.spouseType,
              startDate: formData.startDate,
              endDate: formData.endDate,
            },
          };
        }
        return e;
      }));
      
      setPendingRelationship(null);
      setSelectedRelationship(null);
    } catch (error) {
      console.error('Failed to save relationship:', error);
      alert('Failed to save relationship: ' + error.message);
    }
  };

  const handleNodeDragStop = useCallback(async (event, node) => {
    try {
      const db = dbService.getDatabase();
      const person = await db.getPerson(node.id);
      
      const snappedY = snapToLayer(node.position.y);
      const newGeneration = getGenerationFromY(snappedY);
      
      person.positionX = node.position.x;
      person.positionY = snappedY;
      person.generation = newGeneration;
      
      await db.updatePerson(person);
      console.log(`Saved position for ${person.firstName}: (${person.positionX}, ${person.positionY}), generation: ${person.generation}`);
      
      setNodes((nds) => nds.map(n => {
        if (n.id === node.id) {
          return {
            ...n,
            position: { x: node.position.x, y: snappedY },
            data: {
              ...n.data,
              generation: newGeneration,
            },
          };
        }
        return n;
      }));
    } catch (error) {
      console.error('Failed to save position:', error);
    }
  }, []);

  if (!isDbReady) {
    return <div style={{ padding: '20px' }}>Loading database...</div>;
  }

  const relationshipForModal = pendingRelationship || selectedRelationship;

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ 
        position: 'absolute', 
        top: 10, 
        left: 10, 
        zIndex: 10,
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
      }}>
        <button 
          onClick={addPerson} 
          style={{ 
            padding: '10px 20px', 
            cursor: 'pointer',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
          }}
        >
          + Add Person
        </button>
        
        <button 
          onClick={exportJSON} 
          style={{ 
            padding: '10px 20px', 
            cursor: 'pointer',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
          }}
        >
          Export JSON
        </button>
        
        <label style={{ 
          padding: '10px 20px', 
          cursor: 'pointer',
          background: '#8b5cf6',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontWeight: 'bold',
        }}>
          Import JSON
          <input 
            type="file" 
            accept=".json" 
            onChange={importJSON} 
            style={{ display: 'none' }}
          />
        </label>
        
        <button 
          onClick={exportGEDCOM} 
          style={{ 
            padding: '10px 20px', 
            cursor: 'pointer',
            background: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
          }}
        >
          Export GEDCOM
        </button>
        
        <label style={{ 
          padding: '10px 20px', 
          cursor: 'pointer',
          background: '#ec4899',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontWeight: 'bold',
        }}>
          Import GEDCOM
          <input 
            type="file" 
            accept=".ged" 
            onChange={importGEDCOM} 
            style={{ display: 'none' }}
          />
        </label>
        
        <button 
          onClick={clearDatabase} 
          style={{ 
            padding: '10px 20px', 
            cursor: 'pointer',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
          }}
        >
          Clear Database
        </button>
      </div>
      
      <div style={{ 
        position: 'absolute', 
        top: 70, 
        left: 10, 
        zIndex: 10,
        background: 'white',
        padding: '12px',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        fontSize: '12px',
      }}>
        <div><strong>Instructions:</strong></div>
        <div>• Click person to edit name/dates</div>
        <div>• Drag person - auto-snaps to layer</div>
        <div>• Blue → Green = parent-child</div>
        <div>• Red → Red = spouse (same size dots)</div>
        <div>• Click spouse line to edit type/dates</div>
      </div>

      <LanguageSelector 
        currentLang={lang} 
        onLanguageChange={setLang} 
      />
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        isValidConnection={isValidConnection}
        connectionMode="loose"
        
        // Multi-selection props
        selectionOnDrag={true}
        panOnDrag={[1, 2]}
        selectionMode="partial"
        multiSelectionKeyCode="Shift"
        
        fitView
        connectionLineStyle={{ stroke: '#ef4444', strokeWidth: 3 }}
        connectionLineType="straight"
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
      
      <PersonEditModal
        person={selectedPerson}
        onSave={handleSavePerson}
        onCancel={() => setSelectedPerson(null)}
        onDelete={handleDeletePerson}
        t={t}
        lang={lang}
      />
      
      <RelationshipEditModal
        relationship={relationshipForModal}
        onSave={handleSaveRelationship}
        onCancel={() => {
          setPendingRelationship(null);
          setSelectedRelationship(null);
        }}
        onDelete={handleDeleteRelationship}
        t={t}
      />
    </div>
  );
}
