import { useEffect, useRef } from 'react';
import { routeTo } from './algorithm';

export default function MinimumDepthStory({ run, stepIndex }) {
  const step = run.frames[Math.max(0, stepIndex)];
  const viewport = useRef(null);
  const route = routeTo(run.nodes, step.nodeId);
  const routeIds = new Set(route.map(node => node.id));
  const depth = run.nodes[step.nodeId]?.depth;
  useEffect(() => {
    const position = run.positions[step.nodeId ?? 0];
    const element = viewport.current;
    if (!element || !position) return;
    const center = () => {
      element.scrollLeft = Math.max(0, position.x - element.clientWidth / 2);
      element.scrollTop = Math.max(0, position.y - element.clientHeight / 2);
    };
    center();
    const observer = new ResizeObserver(center);
    observer.observe(element);
    return () => observer.disconnect();
  }, [run, step.nodeId]);
  return <div className="mdbt-story">
    <p className="mdbt-story-caption" role="status">{step.message}</p>
    <div className="mdbt-story-viewport" ref={viewport} tabIndex={0} aria-label="Tree depth diagram; scroll to explore">
      <svg width={run.width} height={run.height} role="img" aria-label={`Depth counts nodes. Current route: ${route.map(n => n.val).join(', ') || 'none'}.`}>
        {Array.from({ length: Math.max(0, ...run.nodes.map(node => node.depth)) }, (_, index) => <g key={index}>
          <rect x="0" y={index * 100 + 10} width={run.width} height="90" className={`mdbt-depth-band ${depth === index + 1 ? 'is-current' : ''}`} />
          <text x="8" y={index * 100 + 28} className="mdbt-depth-label">Depth {index + 1}</text>
        </g>)}
        {run.nodes.filter(n => n.parent !== null).map(node => {
          const from = run.positions[node.parent], to = run.positions[node.id];
          return <line key={node.id} x1={from.x} y1={from.y} x2={to.x} y2={to.y} className={`mdbt-route-edge ${routeIds.has(node.id) ? 'on-route' : ''}`} />;
        })}
        {run.nodes.map(node => {
          const position = run.positions[node.id];
          const leaf = node.left === null && node.right === null;
          const returned = node.returnAt <= stepIndex;
          return <g key={node.id} transform={`translate(${position.x} ${position.y})`} className={`mdbt-story-node ${routeIds.has(node.id) ? 'on-route' : ''} ${step.phase === 'done' && routeIds.has(node.id) ? 'winner' : ''}`}>
            <title>{`Node ${node.id}: ${node.val}${leaf ? ', leaf' : ''}`}</title>
            <circle r="22" /><text textAnchor="middle" dy="5">{node.val}</text>
            <text className="mdbt-node-note" textAnchor="middle" y="38">{leaf ? 'leaf' : returned ? `returns ${node.returnedDepth}` : ''}</text>
            {node.id === step.nodeId && step.missingSide && <g transform={`translate(${step.missingSide === 'left' ? -48 : 48} 50)`}>
              <path d={`M0 0 L${step.missingSide === 'left' ? 35 : -35} -30`} className="mdbt-missing-edge" />
              <rect x="-35" y="-10" width="70" height="30" rx="6" className="mdbt-missing-box" /><text textAnchor="middle" y="3" className="mdbt-node-note">no child</text><text textAnchor="middle" y="36" className="mdbt-node-note">not a leaf</text>
            </g>}
          </g>;
        })}
        {!run.nodes.length && <text x="20" y="70" className="mdbt-depth-label">Empty tree → depth 0</text>}
      </svg>
    </div>
    <div className="vis-panel">
      <div className="vis-panel-head">{step.phase === 'done' ? 'Shortest complete route' : 'Current root-to-node route'}</div>
      <div className="vis-panel-body">{route.length ? `${route.map(node => node.val).join(' → ')} · ${route.length} ${route.length === 1 ? 'node' : 'nodes'}` : 'Start at the root.'}</div>
    </div>
    <small>Blue edges follow the current route. Green marks the final shortest route. Depth counts nodes, not edges.</small>
  </div>;
}

export function MinimumDepthComparison({ run, stepIndex }) {
  if (!run) return <p role="alert">Correct the tree input to compare routes.</p>;
  const step = run.frames[Math.max(0, stepIndex)];
  const leaves = run.nodes.filter(node => node.leafAt <= stepIndex);
  return <div className="mdbt-story">
    <section className="vis-panel"><h3 className="vis-panel-head">{step.phase === 'done' ? 'Minimum depth' : 'Best leaf found so far'}</h3>
      <div className="vis-panel-body"><strong>{Number.isFinite(step.minDepth) ? step.minDepth : 'No leaf checked yet'}</strong><p>A missing child is an absent branch, not a destination.</p></div></section>
    <ol className="mdbt-leaf-routes">{leaves.map(leaf => <li key={leaf.id} aria-current={leaf.id === step.bestLeaf ? 'true' : undefined}>
      <span>{routeTo(run.nodes, leaf.id).map(n => n.val).join(' → ')}</span><strong>{leaf.depth} nodes{leaf.id === step.bestLeaf ? ' ✓ best' : ''}</strong>
    </li>)}</ol>
    {!leaves.length && <p>Complete root-to-leaf routes will appear here as DFS reaches them.</p>}
  </div>;
}
