import { Handle, Position } from 'reactflow';

export function PersonNode({ data, isConnectable }) {
  const photoPlaceholder = data.photo || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBQaG90bzwvdGV4dD48L3N2Zz4=';
  
  return (
    <div style={{
      border: '3px solid #333',
      borderRadius: '4px',
      background: '#fff',
      width: '180px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      overflow: 'hidden'
    }}>
      {/* Parent connections - top */}
<Handle
  type="target"
  position={Position.Top}
  id="parent"
  isConnectable={isConnectable}
  style={{ background: '#10b981', width: '16px', height: '16px', borderRadius: '50%' }}
/>

{/* Left spouse handle */}
<Handle
  type="source"
  position={Position.Left}
  id="spouse-left"
  isConnectable={isConnectable}
  style={{ 
    background: '#ef4444', 
    width: '16px', 
    height: '16px',
    border: '2px solid white',
    borderRadius: '50%',
    top: '50%',
    left: '-8px',
    cursor: 'crosshair',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
  }}
/>

{/* Right spouse handle */}
<Handle
  type="target"
  position={Position.Right}
  id="spouse-right"
  isConnectable={isConnectable}
  style={{ 
    background: '#ef4444', 
    width: '16px', 
    height: '16px',
    border: '2px solid white',
    borderRadius: '50%',
    top: '50%',
    right: '-8px',
    cursor: 'crosshair',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
  }}
/>

{/* Children connections - bottom */}
<Handle
  type="source"
  position={Position.Bottom}
  id="child"
  isConnectable={isConnectable}
  style={{ background: '#3b82f6', width: '16px', height: '16px', borderRadius: '50%' }}
/>
      
      {/* Photo frame */}
      <div style={{
        width: '100%',
        height: '200px',
        background: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <img 
          src={photoPlaceholder} 
          alt={`${data.firstName} ${data.lastName}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>
      
      {/* Info section */}
      <div style={{
        padding: '12px',
        background: '#fff',
        borderTop: '2px solid #333'
      }}>
        <div style={{ 
          fontWeight: 'bold', 
          fontSize: '14px',
          marginBottom: '8px',
          textAlign: 'center'
        }}>
          {data.firstName} {data.lastName}
        </div>
        
        {data.birthDate && (
          <div style={{ fontSize: '11px', color: '#666', textAlign: 'center' }}>
            ★ {data.birthDate}
          </div>
        )}
        
        {data.deathDate && (
          <div style={{ fontSize: '11px', color: '#666', textAlign: 'center' }}>
            ✝ {data.deathDate}
          </div>
        )}
      </div>
    </div>
  );
}
