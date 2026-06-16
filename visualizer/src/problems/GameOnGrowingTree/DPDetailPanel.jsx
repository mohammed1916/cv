import { motion } from 'framer-motion';
import './DPDetailPanel.css';

export default function DPDetailPanel({ step, dpSnapshot }) {
  if (!step || !dpSnapshot) {
    return (
      <div className="dp-detail-empty">
        <p>DP details will appear when viewing algorithm steps.</p>
      </div>
    );
  }

  const { sourceNode, targetNode } = step.focus || {};
  const snapshotLimit = dpSnapshot.first.length;

  // Determine which node's triplet to highlight
  const highlightNode = sourceNode ?? targetNode;
  const highlightLabel = sourceNode !== undefined ? `Target: ${targetNode}` : `Source: ${sourceNode}`;

  return (
    <div className="dp-detail-container">
      <div className="dp-detail-header">
        <h3>DP Triplet State</h3>
        <p className="dp-detail-subtitle">{highlightLabel}</p>
      </div>

      <div className="dp-detail-grid">
        {Array.from({ length: Math.min(snapshotLimit, 10) }).map((_, idx) => {
          const isHighlighted = idx === highlightNode;
          const first = dpSnapshot.first[idx] || 0;
          const second = dpSnapshot.second[idx] || 0;
          const third = dpSnapshot.third[idx] || 0;

          return (
            <motion.div
              key={`triplet-${idx}`}
              className={`dp-triplet-card ${isHighlighted ? 'highlighted' : ''}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <div className="dp-triplet-label">Node {idx}</div>
              <div className="dp-triplet-values">
                <div className="dp-rank-row rank-1st">
                  <span className="dp-rank-badge">🥇</span>
                  <span className="dp-rank-value">{first}</span>
                </div>
                <div className="dp-rank-row rank-2nd">
                  <span className="dp-rank-badge">🥈</span>
                  <span className="dp-rank-value">{second}</span>
                </div>
                <div className="dp-rank-row rank-3rd">
                  <span className="dp-rank-badge">🥉</span>
                  <span className="dp-rank-value">{third}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
