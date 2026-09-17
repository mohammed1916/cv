import StoryPanel from '../../components/shared/StoryPanel';
import SvgViewport from '../../components/shared/SvgViewport';
import './MaxPathStory.css';

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

export default function MaxPathStory({ story, step }) {
  if (!story || !step) {
    return (
      <StoryPanel title="Binary Tree Maximum Path Sum" description="Provide a valid binary tree to begin.">
        <p className="mps-empty-notice">No tree to display.</p>
      </StoryPanel>
    );
  }

  const { positions, nodes, edges, width, height } = story;
  const turnaroundSet = new Set(step.currentTurnaroundPath || []);
  const isDone = step.phase === 'done';
  const bestSet = new Set(isDone ? story.bestPathNodes : step.bestPathNodes || []);

  const formattedMax = Number.isFinite(step.maxSum) ? step.maxSum : '−∞';

  return (
    <StoryPanel
      title="Binary Tree Maximum Path Sum: Post-Order DFS"
      description={step.explanation || step.message}
      label="Tree maximum path sum story panel"
      className="mps-story-panel"
    >
      {/* Metrics Banner */}
      <div className="mps-metrics-grid" role="region" aria-label="Path sum metrics">
        <div className="mps-metric-card mps-metric-max">
          <span className="mps-metric-label">Global Max Sum</span>
          <span className="mps-metric-value">{formattedMax}</span>
        </div>

        <div className="mps-metric-card">
          <span className="mps-metric-label">Current Phase</span>
          <span className={`mps-phase-tag mps-phase-${step.phase}`}>
            {step.phase.toUpperCase()}
          </span>
        </div>

        {step.pathThrough != null && (
          <div className="mps-metric-card mps-metric-turnaround">
            <span className="mps-metric-label">Turnaround at Apex #{step.nodeId} (val: {step.nodeVal})</span>
            <span className="mps-metric-formula">
              {step.nodeVal} + {step.leftGain ?? 0} (L) + {step.rightGain ?? 0} (R) = <strong>{step.pathThrough}</strong>
            </span>
          </div>
        )}

        {step.singleBranchGain != null && (
          <div className="mps-metric-card">
            <span className="mps-metric-label">Branch Gain to Parent</span>
            <span className="mps-metric-formula">
              {step.nodeVal} + max({step.leftGain ?? 0}, {step.rightGain ?? 0}) = <strong>{step.singleBranchGain}</strong>
            </span>
          </div>
        )}
      </div>

      {/* SVG Canvas with Pan/Zoom Controls */}
      <div className="mps-canvas-wrapper">
        <SvgViewport
          width={Math.max(420, width)}
          height={Math.max(280, height)}
          className="mps-viewport"
        >
          {/* Edges */}
          {edges.map((edge) => {
            const from = positions.get(edge.fromId);
            const to = positions.get(edge.toId);
            if (!from || !to) return null;

            const inTurnaround = isEdgeInPath(edge, step.currentTurnaroundPath);
            const inBest = isEdgeInPath(edge, isDone ? story.bestPathNodes : step.bestPathNodes);

            let edgeClass = 'mps-edge';
            if (isDone && inBest) {
              edgeClass += ' mps-edge-winner';
            } else if (inTurnaround) {
              edgeClass += ' mps-edge-turnaround';
            } else if (inBest) {
              edgeClass += ' mps-edge-best';
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
            const isApex = (step.phase === 'compute' || step.phase === 'update') && isActive;
            const isTurnaround = turnaroundSet.has(node.id);
            const isBest = bestSet.has(node.id);
            const isWinner = isDone && isBest;

            let nodeClass = 'mps-node';
            if (isWinner) nodeClass += ' mps-node-winner';
            else if (isApex) nodeClass += ' mps-node-apex';
            else if (isTurnaround) nodeClass += ' mps-node-turnaround';
            else if (isBest) nodeClass += ' mps-node-best';
            else if (isActive) nodeClass += ' mps-node-active';

            const gainVal = step.gainMap ? step.gainMap[node.id] : null;

            return (
              <g
                key={`node-${node.id}`}
                transform={`translate(${pos.x}, ${pos.y})`}
                className={nodeClass}
              >
                <title>{`Node #${node.id} | val: ${node.val}${gainVal != null ? ` | gain: ${gainVal}` : ''}`}</title>
                <circle r="22" className="mps-node-circle" />
                <text textAnchor="middle" dy="5" className="mps-node-val">
                  {node.val}
                </text>
                <text textAnchor="middle" y="-28" className="mps-node-id">
                  #{node.id}
                </text>

                {gainVal != null && (
                  <g transform="translate(0, 36)" className="mps-gain-group">
                    <rect
                      x="-26"
                      y="-10"
                      width="52"
                      height="16"
                      rx="4"
                      className={`mps-gain-pill ${gainVal <= 0 ? 'is-clipped' : ''}`}
                    />
                    <text textAnchor="middle" dy="2" className="mps-gain-text">
                      {gainVal > 0 ? `+${gainVal}` : gainVal}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </SvgViewport>
      </div>

      {/* Path Witness Summary */}
      <div className="mps-footer-info">
        {isDone ? (
          <div className="mps-winner-banner" role="status">
            <span className="mps-trophy">★</span>
            <span>
              Optimal turnaround path: <strong>[{story.bestPathValues.join(' → ')}]</strong> with maximum sum{' '}
              <strong>{story.maxSum}</strong>.
            </span>
          </div>
        ) : step.currentTurnaroundPath && step.currentTurnaroundPath.length > 0 ? (
          <div className="mps-turnaround-info">
            Turnaround path through apex #{step.nodeId}:{' '}
            <strong>[{step.currentTurnaroundValues?.join(' → ')}]</strong> = {step.currentTurnaroundSum}
          </div>
        ) : (
          <div className="mps-turnaround-info">
            Evaluating tree in post-order. Exploring children before computing turnaround path.
          </div>
        )}

        {/* Legend */}
        <div className="mps-legend" aria-label="Diagram legend">
          <span className="mps-legend-item">
            <span className="mps-dot mps-dot-active" /> Current Node
          </span>
          <span className="mps-legend-item">
            <span className="mps-dot mps-dot-turnaround" /> Turnaround Path
          </span>
          <span className="mps-legend-item">
            <span className="mps-dot mps-dot-winner" /> Optimal Witness Path
          </span>
          <span className="mps-legend-item">
            <span className="mps-dot mps-dot-gain" /> Single-Branch Gain
          </span>
        </div>
      </div>
    </StoryPanel>
  );
}
