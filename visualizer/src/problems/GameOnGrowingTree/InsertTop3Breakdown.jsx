import { motion } from 'framer-motion';
import './InsertTop3Breakdown.css';

/**
 * InsertTop3Breakdown - Shows step-by-step logic of inserting a value into top-3 array
 * Displays comparisons, before/after states, and final position
 */
export default function InsertTop3Breakdown({ step, dpSnapshot }) {
  if (!step || !dpSnapshot || !step.focus) {
    return (
      <div className="insert-empty">
        <p>InsertTop3 details appear during DP updates (lines 12-14, 21-23).</p>
      </div>
    );
  }

  const { targetNode } = step.focus;
  const message = step.message || '';

  // Extract values from step message
  const depthMatch = message.match(/depth (\d+)/);
  const depthValue = depthMatch ? parseInt(depthMatch[1]) : 0;

  const first = dpSnapshot.first[targetNode] || 0;
  const second = dpSnapshot.second[targetNode] || 0;
  const third = dpSnapshot.third[targetNode] || 0;

  // Simulate the insertTop3 logic to show what happened
  const getInsertResult = () => {
    if (depthValue > first) {
      return {
        position: '1st',
        comparison: `${depthValue} > ${first}`,
        result: 'YES',
        action: 'Becomes 1st, shifts others right',
        shifts: [
          { from: 'first', to: 'second', value: first },
          { from: 'second', to: 'third', value: second },
        ],
        accepted: true,
        rank: 1,
      };
    }
    if (depthValue > second) {
      return {
        position: '2nd',
        comparison: `${depthValue} > ${second}`,
        result: 'YES',
        action: 'Becomes 2nd, shifts 3rd right',
        shifts: [
          { from: 'second', to: 'third', value: second },
        ],
        accepted: true,
        rank: 2,
      };
    }
    if (depthValue > third) {
      return {
        position: '3rd',
        comparison: `${depthValue} > ${third}`,
        result: 'YES',
        action: 'Becomes 3rd',
        shifts: [],
        accepted: true,
        rank: 3,
      };
    }
    return {
      position: 'none',
      comparison: `${depthValue} ≤ ${third}`,
      result: 'NO',
      action: 'Rejected (too small for top-3)',
      shifts: [],
      accepted: false,
      rank: 0,
    };
  };

  const result = getInsertResult();

  return (
    <div className="insert-breakdown-container">
      <div className="insert-header">
        <h3>InsertTop3 Breakdown</h3>
        <p className="insert-subtitle">Step-by-step insertion logic for node {targetNode}</p>
      </div>

      <motion.div
        className="insert-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Input value */}
        <div className="insert-section">
          <div className="section-title">Incoming value</div>
          <motion.div
            className="insert-value-box incoming"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <span className="value-label">depth</span>
            <span className="value-number">{depthValue}</span>
          </motion.div>
        </div>

        {/* Comparisons */}
        <div className="insert-section">
          <div className="section-title">Comparisons</div>
          <div className="comparisons-stack">
            <motion.div
              className={`comparison-step ${first > 0 ? 'checked' : 'skipped'}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <span className="comp-label">vs 1st:</span>
              <span className="comp-values">{depthValue} &gt; {first}?</span>
              <span className={`comp-result ${depthValue > first ? 'yes' : 'no'}`}>
                {depthValue > first ? '✓ YES' : '✗ NO'}
              </span>
            </motion.div>

            {depthValue <= first && (
              <motion.div
                className={`comparison-step ${second > 0 ? 'checked' : 'skipped'}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="comp-label">vs 2nd:</span>
                <span className="comp-values">{depthValue} &gt; {second}?</span>
                <span className={`comp-result ${depthValue > second ? 'yes' : 'no'}`}>
                  {depthValue > second ? '✓ YES' : '✗ NO'}
                </span>
              </motion.div>
            )}

            {depthValue <= first && depthValue <= second && (
              <motion.div
                className={`comparison-step ${third > 0 ? 'checked' : 'skipped'}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
              >
                <span className="comp-label">vs 3rd:</span>
                <span className="comp-values">{depthValue} &gt; {third}?</span>
                <span className={`comp-result ${depthValue > third ? 'yes' : 'no'}`}>
                  {depthValue > third ? '✓ YES' : '✗ NO'}
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Decision */}
        <motion.div
          className={`insert-section decision ${result.accepted ? 'accepted' : 'rejected'}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="section-title">Decision</div>
          <div className={`decision-badge ${result.rank > 0 ? `rank-${result.rank}` : ''}`}>
            {result.accepted ? `Ranked ${result.rank}${result.rank === 1 ? 'st' : result.rank === 2 ? 'nd' : 'rd'}` : '❌ Rejected'}
          </div>
          <p className="decision-text">{result.action}</p>
        </motion.div>

        {/* State changes */}
        {result.shifts.length > 0 && (
          <div className="insert-section">
            <div className="section-title">State changes</div>
            <div className="shifts-list">
              {result.shifts.map((shift, idx) => (
                <motion.div
                  key={idx}
                  className="shift-item"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.05 }}
                >
                  <span className="shift-from">{shift.from}</span>
                  <span className="shift-arrow">→</span>
                  <span className="shift-to">{shift.to}</span>
                  <span className="shift-value">({shift.value})</span>
                </motion.div>
              ))}
              {result.rank >= 1 && (
                <motion.div
                  className="shift-item new-value"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + result.shifts.length * 0.05 }}
                >
                  <span className={`shift-position ${result.rank}`}>{result.position}</span>
                  <span className="shift-arrow">←</span>
                  <span className="shift-value">{depthValue}</span>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Final triplet state */}
        <div className="insert-section">
          <div className="section-title">Result state</div>
          <div className="triplet-result">
            <div className={`triplet-cell ${result.rank === 1 ? 'updated rank-1st' : ''}`}>
              <span className="cell-label">1st</span>
              <span className="cell-value">{first}</span>
            </div>
            <div className={`triplet-cell ${result.rank === 2 ? 'updated rank-2nd' : ''}`}>
              <span className="cell-label">2nd</span>
              <span className="cell-value">{second}</span>
            </div>
            <div className={`triplet-cell ${result.rank === 3 ? 'updated rank-3rd' : ''}`}>
              <span className="cell-label">3rd</span>
              <span className="cell-value">{third}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
