# Bug Fix - Add Person Button

## Issues Fixed

### 1. IndexedDB Promise Handling
**Problem**: IndexedDB operations (like `store.add()`, `store.get()`) return `IDBRequest` objects, not Promises. They weren't being properly awaited.

**Fix**: Wrapped all IndexedDB operations in proper Promises with `onsuccess`/`onerror` handlers.

**File**: `shared-core/database/IndexedDBDatabase.js`

### 2. UUID Generation Fallback
**Problem**: `crypto.randomUUID()` might not be available in all browsers/contexts.

**Fix**: Added fallback UUID generator that works everywhere.

**Files**: 
- `shared-core/models/Person.js`
- `shared-core/models/Relationship.js`

### 3. Better Error Handling & Logging
**Added**: Console logs throughout to help debug issues.

**Files**:
- `ui/src/components/FamilyTreeFlow.jsx`
- `ui/src/services/database.js`

## Testing Steps

1. **Open browser console** (F12)
2. **Run the app**: `npm run dev:web`
3. **Click "Add Person"**
4. **Check console logs**:

Should see:
```
Initializing database, isTauri: false
Using IndexedDB
Database initialized successfully
Loading family tree...
Loaded persons: 0
Loaded relationships: 0
...
Adding new person...
Creating person: Person { ... }
Person created successfully
Reloading tree...
Loading family tree...
Loaded persons: 1
...
```

## What Should Happen

1. Click "+ Add Person" button
2. A new card appears on the canvas
3. Name: "New Person"
4. Positioned at x=100, y=100 (generation 0)
5. Has placeholder photo
6. Can be dragged around
7. Can connect to other people

## If It Still Doesn't Work

**Check browser console for:**
- Red error messages
- Failed database operations
- Module import errors

**Common issues:**
- Browser not supporting IndexedDB (very rare)
- CORS issues (run from localhost:3000, not file://)
- React Fast Refresh conflicts (hard refresh: Ctrl+Shift+R)

## Quick Test

Open browser console and run:
```javascript
// Test database directly
const db = indexedDB.open('FamilyTreeDB', 1);
db.onsuccess = () => console.log('DB accessible');
```

## Debugging Commands

In browser console:
```javascript
// Check if person was created
const db = indexedDB.open('FamilyTreeDB', 1);
db.onsuccess = (e) => {
  const database = e.target.result;
  const tx = database.transaction(['persons'], 'readonly');
  const store = tx.objectStore('persons');
  const req = store.getAll();
  req.onsuccess = () => console.log('All persons:', req.result);
};
```

## Next Steps

If working:
- Try adding multiple people
- Try connecting them (drag from handle to handle)
- Check if they organize by generation

If not working:
- Share console errors
- Check if IndexedDB is enabled in browser
- Try different browser
