# Quick Start Guide

## 1. Install Dependencies

```bash
cd thefamilytreeapp
npm install
```

## 2. Run Web Version (Easiest to test)

```bash
npm run dev:web
```

Then open http://localhost:3000 in your browser.

## 3. Run Desktop Version (Requires Rust)

First, install Rust from https://rustup.rs/

Then:
```bash
npm run dev:desktop
```

## What You'll See

- A canvas with React Flow controls (zoom, minimap)
- An "Add Person" button at the top left
- Click to add people to your family tree
- Drag connections between people to create relationships

## Current Limitations

This is a skeleton - you'll need to add:
- Person editing forms
- Relationship type selection
- Import/Export UI
- Photo upload
- More styling

## File Structure Overview

**Core Logic (shared-core/):**
- `models/Person.js` - Person data model
- `models/Relationship.js` - Relationship data model
- `database/IndexedDBDatabase.js` - Web storage
- `database/SQLiteDatabase.js` - Desktop storage
- `gedcom/GedcomHandler.js` - GEDCOM import/export

**UI (ui/):**
- `src/App.jsx` - Main app component
- `src/components/FamilyTreeFlow.jsx` - Main canvas
- `src/components/PersonNode.jsx` - Person display
- `src/components/RelationshipEdge.jsx` - Connection lines
- `src/services/database.js` - DB selector

**Desktop (desktop/):**
- `src-tauri/src/main.rs` - Rust backend with SQLite

## Next Development Steps

1. Add person edit form
2. Add relationship type selector
3. Implement import/export buttons
4. Add photo upload
5. Improve GEDCOM support
6. Add better layout algorithms
