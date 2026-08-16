import { motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import './DPDetailPanel.css';

export default function DPDetailPanel({ step, dpSnapshot }) {
  const [prevSnapshot, setPrevSnapshot] = useState(null);
  const [flashingNode, setFlashingNode] = useState(null);
  const prevRef = useRef(null);

  // Track when a triplet changes and show animation
  useEffect(() => {
    if (!step || !dpSnapshot) return;

    const { targetNode } = step.focus || {};
    if (targetNode !== undefined && prevRef.current) {
      const prevFirst = prevRef.current.first?.[targetNode] || 0;
      const currFirst = dpSnapshot.first?.[targetNode] || 0;
      const prevSecond = prevRef.current.second?.[targetNode] || 0;
      const currSecond = dpSnapshot.second?.[targetNode] || 0;
      const prevThird = prevRef.current.third?.[targetNode] || 0;
      const currThird = dpSnapshot.third?.[targetNode] || 0;

      if (prevFirst !== currFirst || prevSecond !== currSecond || prevThird !== currThird) {
        setFlashingNode(targetNode);
        const timer = setTimeout(() => setFlashingNode(null), 600);
        return () => clearTimeout(timer);
      }
    }

    prevRef.current = dpSnapshot;
  }, [step, dpSnapshot]);

  useEffect(() => {
    prevRef.current = dpSnapshot;
  }, [dpSnapshot]);

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
          const isFlashing = idx === flashingNode;
          const first = dpSnapshot.first[idx] || 0;
          const second = dpSnapshot.second[idx] || 0;
          const third = dpSnapshot.third[idx] || 0;

          return (
            <motion.div
              key={`triplet-${idx}`}
              className={`dp-triplet-card ${isHighlighted ? 'highlighted' : ''} ${isFlashing ? 'flashing' : ''}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{
                opacity: 1,
                scale: 1,
                ...(isFlashing && {
                  boxShadow: [
                    '0 0 0 0px rgba(255, 107, 53, 0.4)',
                    '0 0 0 8px rgba(255, 107, 53, 0)',
                  ],
                })
              }}
              transition={{
                delay: idx * 0.05,
                ...(isFlashing && {
                  boxShadow: { duration: 0.6, times: [0, 1] }
                })
              }}
            >
              <div className="dp-triplet-label">Node {idx}</div>
              <div className="dp-triplet-values">
                <motion.div
                  className="dp-rank-row rank-1st"
                  animate={isFlashing && first > 0 ? { backgroundColor: ['transparent', 'rgba(255, 193, 7, 0.3)', 'transparent'] } : {}}
                  transition={isFlashing ? { duration: 0.6 } : {}}
                >
                  <span className="dp-rank-badge">🥇</span>
                  <span className="dp-rank-value">{first}</span>
                </motion.div>
                <motion.div
                  className="dp-rank-row rank-2nd"
                  animate={isFlashing && second > 0 ? { backgroundColor: ['transparent', 'rgba(192, 192, 192, 0.3)', 'transparent'] } : {}}
                  transition={isFlashing ? { duration: 0.6 } : {}}
                >
                  <span className="dp-rank-badge">🥈</span>
                  <span className="dp-rank-value">{second}</span>
                </motion.div>
                <motion.div
                  className="dp-rank-row rank-3rd"
                  animate={isFlashing && third > 0 ? { backgroundColor: ['transparent', 'rgba(205, 127, 50, 0.3)', 'transparent'] } : {}}
                  transition={isFlashing ? { duration: 0.6 } : {}}
                >
                  <span className="dp-rank-badge">🥉</span>
                  <span className="dp-rank-value">{third}</span>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
