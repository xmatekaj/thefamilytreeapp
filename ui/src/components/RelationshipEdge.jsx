import { useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from 'reactflow';

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
  
  // Use bezier curves for better looking connections
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
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
                  background: 'transparent',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  lineHeight: 1,
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