import { TreeCanvas3D } from '../viz3d';

export default function TraversalTreePanel({ positions, edges, allNodes, step }) {
  const width=Math.max(320,...[...positions.values()].map(p=>p.x+48));
  const height=Math.max(240,...[...positions.values()].map(p=>p.y+48));
  return <div style={{maxWidth:'100%',overflow:'auto'}} tabIndex={0} aria-label="Traversal tree; scroll to explore">
    <div style={{width,height}}>
      <TreeCanvas3D positions={positions} edges={edges} allNodes={allNodes}
        activeIds={step?.activeIds ?? new Set()} visitedIds={step?.visitedIds ?? new Set()}
        queueIds={step?.queueIds ?? new Set()} canvasWidth={width} canvasHeight={height} nodeRadius={22}/>
    </div>
  </div>;
}
