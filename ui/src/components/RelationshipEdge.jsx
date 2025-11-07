import { BaseEdge, EdgeLabelRenderer, getStraightPath } from 'reactflow';

export function RelationshipEdge({ id, sourceX, sourceY, targetX, targetY, data }) {
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge 
        id={id} 
        path={edgePath} 
        style={{ 
          stroke: data.color || '#333',
          strokeWidth: 3,
          cursor: data.relType === 'spouse' ? 'pointer' : 'default',
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: data.color || '#333',
            color: '#fff',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 'bold',
            pointerEvents: 'all',
            cursor: data.relType === 'spouse' ? 'pointer' : 'default',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
          className="nodrag nopan"
        >
          {data.label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
