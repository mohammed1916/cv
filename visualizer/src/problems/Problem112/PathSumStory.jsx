import { getRoute } from './algorithm';
import { useEffect, useRef } from 'react';

export default function PathSumStory({ run, stepIndex }) {
  const step = run.frames[Math.max(0, stepIndex)];
  const route = getRoute(run.nodes, step.nodeId);
  const pathIds = new Set(route.map(node => node.id));
  const success = step.phase === 'found' || step.result === true;
  const viewport = useRef(null);
  useEffect(() => {
    const node = run.nodes[step.nodeId ?? 0];
    const element = viewport.current;
    if (!node || !element) return;
    const center = () => {
      element.scrollLeft = Math.max(0, node.x - element.clientWidth / 2);
      element.scrollTop = Math.max(0, node.y - element.clientHeight / 2);
    };
    center();
    const observer = new ResizeObserver(center);
    observer.observe(element);
    return () => observer.disconnect();
  }, [run, step.nodeId]);
  return <section className="ps-story" aria-label="Path Sum route exploration">
    <div className="vis-panel ps-story-summary">
      <div className="vis-panel-head">Follow one root-to-leaf route</div>
      <div className="vis-panel-body">
        <div className="ps-story-metrics"><span>Target <strong>{run.target}</strong></span><span>Route total <strong>{step.sum}</strong></span><span>Remaining <strong>{run.target - step.sum}</strong></span></div>
        <p role="status">{step.message}</p>
        <small>Only a leaf can finish the route. A matching total at an internal node is not enough.</small>
      </div>
    </div>
    <div ref={viewport} className="ps-tree-scroll" tabIndex={0} aria-label="Tree diagram; scroll to explore larger trees">
      <svg width={run.width} height={run.height} viewBox={`0 0 ${run.width} ${run.height}`} role="img" aria-label={`Tree with ${run.nodes.length} nodes. Current route: ${route.map(node => node.value).join(', ') || 'none'}.`}>
        {run.nodes.filter(node => node.parent !== null).map(node => {
          const parent = run.nodes[node.parent];
          return <line key={node.id} x1={parent.x} y1={parent.y} x2={node.x} y2={node.y}
            className={`ps-tree-edge ${pathIds.has(node.id) ? 'on-route' : ''}`} />;
        })}
        {run.nodes.map(node => {
          const active = node.id === step.nodeId;
          const onRoute = pathIds.has(node.id);
          const leaf = node.left === null && node.right === null;
          return <g key={node.id} transform={`translate(${node.x} ${node.y})`}
            className={`ps-tree-node ${onRoute ? 'on-route' : ''} ${active ? 'is-current' : ''} ${success && onRoute ? 'is-solution' : ''} ${node.visitAt <= stepIndex && !onRoute ? 'is-explored' : ''}`}>
            <title>{`Node ${node.id}: ${node.value}${leaf ? ', leaf' : ''}${active ? ', current' : ''}`}</title>
            <circle r="22" /><text textAnchor="middle" dy="5">{node.value}</text>
            {active && <text className="ps-node-caption" textAnchor="middle" y="-29">current</text>}
            {leaf && <text className="ps-node-caption" textAnchor="middle" y="38">leaf</text>}
          </g>;
        })}
        {!run.nodes.length && <text x="24" y="70" className="ps-empty-tree">Empty tree → False</text>}
      </svg>
    </div>
    <small>Thick outline: current node · blue edges: current route · dashed outline: explored branch · green: solution</small>
    <div className="ps-route" aria-label="Current route equation">
      {route.length ? <><span>{route.map(node => node.value < 0 ? `(${node.value})` : node.value).join(' + ')} = <strong>{step.sum}</strong></span><span>{success ? '✓ Matching leaf' : step.phase === 'reject' ? '✕ Leaf rejected' : '→ Keep exploring'}</span></> : <span>Start at the root, then explore left before right.</span>}
    </div>
  </section>;
}
