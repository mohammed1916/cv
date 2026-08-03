import { motion } from 'framer-motion';
import './RankHighlightOverlay.css';

/**
 * RankHighlightOverlay - Overlays DP table cells with rank colors (gold/silver/bronze)
 * Can be integrated into TreeStatePanel to highlight the DP values by their rank
 */
export default function RankHighlightOverlay({ dpSnapshot, limit = 10 }) {
  if (!dpSnapshot) return null;

  const getRankColor = (value, first, second, third) => {
    if (value === 0) return 'rank-zero';
    if (value === first && first > 0) return 'rank-1st';
    if (value === second && second > 0) return 'rank-2nd';
    if (value === third && third > 0) return 'rank-3rd';
    return 'rank-none';
  };

  return (
    <div className="rank-overlay-container">
      <div className="rank-overlay-header">
        <h3>Rank Highlights</h3>
        <div className="rank-legend">
          <div className="rank-legend-item">
            <span className="rank-legend-badge rank-1st">🥇</span>
            <span>1st (largest)</span>
          </div>
          <div className="rank-legend-item">
            <span className="rank-legend-badge rank-2nd">🥈</span>
            <span>2nd</span>
          </div>
          <div className="rank-legend-item">
            <span className="rank-legend-badge rank-3rd">🥉</span>
            <span>3rd (smallest)</span>
          </div>
        </div>
      </div>

      <div className="rank-overlay-grid">
        {Array.from({ length: Math.min(dpSnapshot.first.length, limit) }).map((_, idx) => {
          const first = dpSnapshot.first[idx] || 0;
          const second = dpSnapshot.second[idx] || 0;
          const third = dpSnapshot.third[idx] || 0;

          return (
            <motion.div
              key={`rank-${idx}`}
              className="rank-cell-group"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.03 }}
            >
              <div className="rank-cell-label">Node {idx}</div>
              <div className="rank-cells">
                <div className={`rank-cell ${getRankColor(first, first, second, third)}`}>
                  <span className="rank-cell-label-small">1st</span>
                  <span className="rank-cell-value">{first}</span>
                </div>
                <div className={`rank-cell ${getRankColor(second, first, second, third)}`}>
                  <span className="rank-cell-label-small">2nd</span>
                  <span className="rank-cell-value">{second}</span>
                </div>
                <div className={`rank-cell ${getRankColor(third, first, second, third)}`}>
                  <span className="rank-cell-label-small">3rd</span>
                  <span className="rank-cell-value">{third}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
