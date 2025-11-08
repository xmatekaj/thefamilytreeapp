import { useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, getStraightPath } from 'reactflow';

export function RelationshipEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}) {
  const [isHovering, setIsHovering] = useState(false);
  
  // Use straight path for connections
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const handleDelete = (event) => {
    event.stopPropagation();
    if (data?.onDelete) {
      data.onDelete(id);
    }
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: data?.color || '#999',
          strokeWidth: selected ? 3 : 2,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Label with background */}
          <div style={{
            background: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            border: `1px solid ${data?.color || '#999'}`,
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}>
            <span>{data?.label || 'Relationship'}</span>
            
            {/* Delete button - shows on hover */}
            {isHovering && (
              <button
                onClick={handleDelete}
                style={{
                  background: '#ef4444',
                  border: 'none',
                  borderRadius: '3px',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                title="Delete connection"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}