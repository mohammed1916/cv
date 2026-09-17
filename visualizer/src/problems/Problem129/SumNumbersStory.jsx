import StoryPanel from '../../components/shared/StoryPanel';
import SvgViewport from '../../components/shared/SvgViewport';
import './SumNumbersStory.css';

function isEdgeInPath(edge, path) {
  if (!path || path.length < 2) return false;
  for (let i = 0; i < path.length - 1; i++) {
    const u = path[i];
    const v = path[i + 1];
    if ((edge.fromId === u && edge.toId === v) || (edge.fromId === v && edge.toId === u)) {
      return true;
    }
  }
  return false;
}

function isEdgeInAnyCompletedPath(edge, completedPaths) {
  if (!completedPaths) return false;
  return completedPaths.some((p) => isEdgeInPath(edge, p.pathNodeIds));
}

export default function SumNumbersStory({ story, step }) {
  if (!story || !step) {
    return (
      <StoryPanel title="Sum Root to Leaf Numbers" description="Provide a valid binary tree to begin.">
        <p className="srln-empty-notice">No tree to display.</p>
      </StoryPanel>
    );
  }

  const { positions, nodes, edges, width, height } = story;
  const isDone = step.phase === 'done';
  const activePathSet = new Set(step.currentPath || []);
  const completedLeafMap = new Map();
  for (const p of step.completedPaths || []) {
    if (p.leafNodeId != null) {
      completedLeafMap.set(p.leafNodeId, p.value);
    }
  }

  return (
    <StoryPanel
      title="Sum Root to Leaf Numbers: DFS Path Accumulation"
      description={step.explanation || step.message}
      label="Tree sum root to leaf numbers story panel"
      className="srln-story-panel"
    >
      {/* Metrics Banner */}
      <div className="srln-metrics-grid" role="region" aria-label="Sum numbers metrics">
        <div className="srln-metric-card srln-metric-total">
          <span className="srln-metric-label">Running Total Sum</span>
          <span className="srln-metric-value">{step.accumulatedSum}</span>
          <span className="srln-metric-sub">
            {step.completedPaths && step.completedPaths.length > 0
              ? `${step.completedPaths.map((p) => p.value).join(' + ')} = ${step.accumulatedSum}`
              : 'Waiting for first leaf...'}
          </span>
        </div>

        <div className="srln-metric-card srln-metric-current">
          <span className="srln-metric-label">Current Branch Number</span>
          <span className="srln-metric-value srln-value-current">
            {step.currentPathValues && step.currentPathValues.length > 0
              ? step.currentSum
              : '—'}
          </span>
          <span className="srln-metric-sub">{step.calculation || 'current_sum * 10 + val'}</span>
        </div>

        <div className="srln-metric-card">
          <span className="srln-metric-label">DFS Phase</span>
          <span className={`srln-phase-tag srln-phase-${step.phase}`}>
            {step.phase.toUpperCase().replace('-', ' ')}
          </span>
          <span className="srln-metric-sub">
            Stack Depth: {step.callStack ? step.callStack.length : 0}
          </span>
        </div>

        <div className="srln-metric-card srln-metric-path">
          <span className="srln-metric-label">Active Path</span>
          {step.currentPathValues && step.currentPathValues.length > 0 ? (
            <div className="srln-path-breadcrumbs">
              {step.currentPathValues.map((val, idx) => (
                <span key={idx} className="srln-crumb">
                  {idx > 0 && <span className="srln-arrow">→</span>}
                  <span className="srln-crumb-digit">{val}</span>
                </span>
              ))}
              <span className="srln-crumb-equal">=</span>
              <strong className="srln-crumb-result">{step.currentSum}</strong>
            </div>
          ) : (
            <span className="srln-metric-sub">Root initialization</span>
          )}
        </div>
      </div>

      {/* SVG Canvas with Pan/Zoom Controls */}
      <div className="srln-canvas-wrapper" role="region" aria-label="Binary tree diagram">
        <SvgViewport
          width={Math.max(420, width)}
          height={Math.max(280, height)}
          className="srln-viewport"
        >
          {/* Edges */}
          {edges.map((edge) => {
            const from = positions.get(edge.fromId);
            const to = positions.get(edge.toId);
            if (!from || !to) return null;

            const inCurrentPath = isEdgeInPath(edge, step.currentPath);
            const inCompleted = isEdgeInAnyCompletedPath(edge, step.completedPaths);

            let edgeClass = 'srln-edge';
            if (inCurrentPath) {
              edgeClass += ' srln-edge-active';
            } else if (inCompleted) {
              edgeClass += ' srln-edge-completed';
            }

            return (
              <line
                key={`edge-${edge.fromId}-${edge.toId}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                className={edgeClass}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const pos = positions.get(node.id);
            if (!pos) return null;

            const isActive = node.id === step.nodeId;
            const isOnActivePath = activePathSet.has(node.id);
            const isLeaf = completedLeafMap.has(node.id);
            const leafVal = completedLeafMap.get(node.id);

            let nodeClass = 'srln-node';
            if (isActive) nodeClass += ' srln-node-active';
            else if (isOnActivePath) nodeClass += ' srln-node-on-path';
            else if (isLeaf) nodeClass += ' srln-node-leaf';

            return (
              <g
                key={`node-${node.id}`}
                transform={`translate(${pos.x}, ${pos.y})`}
                className={nodeClass}
              >
                <title>{`Node #${node.id} | digit: ${node.val}${isLeaf ? ` | leaf number: ${leafVal}` : ''}`}</title>
                <circle r="22" className="srln-node-circle" />
                <text textAnchor="middle" dy="5" className="srln-node-val">
                  {node.val}
                </text>
                <text textAnchor="middle" y="-28" className="srln-node-id">
                  #{node.id}
                </text>

                {/* Leaf Value Pill */}
                {isLeaf && (
                  <g transform="translate(0, 36)" className="srln-leaf-group">
                    <rect
                      x="-32"
                      y="-10"
                      width="64"
                      height="17"
                      rx="4"
                      className="srln-leaf-pill"
                    />
                    <text textAnchor="middle" dy="2.5" className="srln-leaf-pill-text">
                      = {leafVal}
                    </text>
                  </g>
                )}

                {/* Active non-leaf running number pill */}
                {!isLeaf && isActive && (
                  <g transform="translate(0, 36)" className="srln-active-pill-group">
                    <rect
                      x="-30"
                      y="-10"
                      width="60"
                      height="17"
                      rx="4"
                      className="srln-active-pill"
                    />
                    <text textAnchor="middle" dy="2.5" className="srln-active-pill-text">
                      cur: {step.currentSum}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </SvgViewport>
      </div>

      {/* Discovered Paths & Total Summary */}
      <div className="srln-footer-info" role="region" aria-label="Completed paths and call stack">
        {isDone ? (
          <div className="srln-winner-banner" role="status">
            <span className="srln-trophy">★</span>
            <span>
              All paths explored! Total sum: <strong>{story.totalSum}</strong> across{' '}
              <strong>{story.paths.length}</strong> root-to-leaf path(s).
            </span>
          </div>
        ) : (
          <div className="srln-current-calc-banner">
            <span className="srln-calc-label">DFS Status:</span>
            <span className="srln-calc-text">{step.message}</span>
          </div>
        )}

        {/* Completed Paths List */}
        {step.completedPaths && step.completedPaths.length > 0 && (
          <div className="srln-completed-section">
            <div className="srln-completed-header">
              <span>Completed Root-to-Leaf Numbers ({step.completedPaths.length})</span>
              <span className="srln-running-acc">Sum so far: <strong>{step.accumulatedSum}</strong></span>
            </div>
            <div className="srln-paths-list">
              {step.completedPaths.map((p, idx) => (
                <div key={idx} className="srln-path-badge">
                  <span className="srln-path-num">#{idx + 1}</span>
                  <span className="srln-path-flow">{p.path.join(' → ')}</span>
                  <span className="srln-path-val">= {p.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="srln-legend" aria-label="Diagram legend">
          <span className="srln-legend-item">
            <span className="srln-dot srln-dot-active" /> Active Visiting Node
          </span>
          <span className="srln-legend-item">
            <span className="srln-dot srln-dot-path" /> Active DFS Branch
          </span>
          <span className="srln-legend-item">
            <span className="srln-dot srln-dot-leaf" /> Completed Leaf Node
          </span>
          <span className="srln-legend-item">
            <span className="srln-dot srln-dot-completed" /> Discovered Path
          </span>
        </div>
      </div>
    </StoryPanel>
  );
}
