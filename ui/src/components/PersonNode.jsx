import { Handle, Position } from 'reactflow';
import { Gender } from '../../../shared-core/models/Person.js';

export function PersonNode({ data, isConnectable, selected }) {
  const photoPlaceholder = data.photo || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBQaG90bzwvdGV4dD48L3N2Zz4=';
  
  // Determine border color based on gender
  let borderColor = '#333'; // Default
  if (data.gender === Gender.MALE) {
    borderColor = '#3b82f6'; // Blue
  } else if (data.gender === Gender.FEMALE) {
    borderColor = '#ec4899'; // Pink
  }
  
  const handleSize = '20px'; // Same size for all handles
  
  return (
    <div style={{
      border: `3px solid ${borderColor}`,
      borderRadius: '4px',
      background: '#fff',
      width: '180px',
      boxShadow: selected 
        ? '0 0 0 3px #3b82f6, 0 2px 8px rgba(0,0,0,0.15)'  // Blue glow when selected
        : '0 2px 8px rgba(0,0,0,0.15)',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s ease',
    }}>
      {/* Parent connections - top */}
      <Handle
        type="target"
        position={Position.Top}
        id="parent"
        isConnectable={isConnectable}
        style={{ 
          background: '#10b981', 
          width: handleSize, 
          height: handleSize,
          borderRadius: '50%',
          border: '2px solid white',
          cursor: 'crosshair'
        }}
      />
      
      {/* Spouse LEFT - source only */}
      <Handle
        type="source"
        position={Position.Left}
        id="spouse-left"
        isConnectable={isConnectable}
        style={{ 
          background: '#ef4444', 
          width: handleSize, 
          height: handleSize,
          border: '2px solid white',
          borderRadius: '50%',
          top: '50%',
          left: '-10px',
          cursor: 'crosshair',
        }}
      />

      {/* Spouse RIGHT - target only */}
      <Handle
        type="target"
        position={Position.Right}
        id="spouse-right"
        isConnectable={isConnectable}
        style={{ 
          background: '#ef4444', 
          width: handleSize, 
          height: handleSize,
          border: '2px solid white',
          borderRadius: '50%',
          top: '50%',
          right: '-10px',
          cursor: 'crosshair',
        }}
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
        borderTop: `2px solid ${borderColor}`
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

      {/* Children connections - bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="child"
        isConnectable={isConnectable}
        style={{ 
          background: '#3b82f6', 
          width: handleSize, 
          height: handleSize,
          borderRadius: '50%',
          border: '2px solid white',
          cursor: 'crosshair'
        }}
      />
    </div>
  );
}
