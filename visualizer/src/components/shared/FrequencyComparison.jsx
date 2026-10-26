import { motion } from "framer-motion";
import "./FrequencyComparison.css";

/**
 * Compare two frequency maps / counters.
 *
 * Example:
 *
 * <FrequencyComparison
 *   leftTitle="Need"
 *   rightTitle="Window"
 *   left={step.need}
 *   right={step.have}
 * />
 *
 * Optional:
 *
 * <FrequencyComparison
 *   leftTitle="Required"
 *   rightTitle="Current"
 *   left={required}
 *   right={current}
 *   leftTone="primary"
 *   showZero
 *   emptyText="No frequencies yet"
 * />
 */
export default function FrequencyComparison({
  leftTitle = "Need",
  rightTitle = "Have",
  left = {},
  right = {},
  leftTone = "primary",
  showZero = true,
  emptyText = "No values",
}) {
  const keys = [
    ...new Set([...Object.keys(left || {}), ...Object.keys(right || {})]),
  ].sort((a, b) =>
    String(a).localeCompare(String(b), undefined, {
      numeric: true,
    }),
  );

  const visibleKeys = showZero
    ? keys
    : keys.filter(
        (key) => (left?.[key] ?? 0) !== 0 || (right?.[key] ?? 0) !== 0,
      );

  if (visibleKeys.length === 0) {
    return (
      <div className="frequency-comparison">
        <div className="frequency-comparison-empty">{emptyText}</div>
      </div>
    );
  }

  return (
    <section
      className="frequency-comparison"
      aria-label={`${leftTitle} and ${rightTitle} frequency comparison`}
    >
      <div className="frequency-comparison-head">
        <span className="frequency-comparison-key-heading">Value</span>

        <span className="frequency-comparison-heading">{leftTitle}</span>

        <span className="frequency-comparison-heading">{rightTitle}</span>

        <span
          className="frequency-comparison-status-heading"
          aria-hidden="true"
        />
      </div>

      <div className="frequency-comparison-rows">
        {visibleKeys.map((key) => {
          const leftValue = left?.[key] ?? 0;
          const rightValue = right?.[key] ?? 0;
          const equal = leftValue === rightValue;

          return (
            <motion.div
              layout
              key={key}
              className={`frequency-comparison-row ${
                equal ? "is-match" : "is-different"
              }`}
              initial={false}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.14,
              }}
            >
              <div className="frequency-comparison-key">{key}</div>

              <motion.div
                layout
                className={`frequency-comparison-value left ${leftTone}`}
                key={`left-${key}-${leftValue}`}
                initial={{
                  scale: 0.85,
                  opacity: 0.5,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                transition={{
                  duration: 0.14,
                }}
              >
                {leftValue}
              </motion.div>

              <motion.div
                layout
                className={`frequency-comparison-value right ${
                  equal ? "match" : "different"
                }`}
                key={`right-${key}-${rightValue}`}
                initial={{
                  scale: 0.85,
                  opacity: 0.5,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                transition={{
                  duration: 0.14,
                }}
              >
                {rightValue}
              </motion.div>

              <div
                className={`frequency-comparison-status ${
                  equal ? "match" : "different"
                }`}
                title={
                  equal
                    ? `${leftValue} equals ${rightValue}`
                    : `${leftValue} does not equal ${rightValue}`
                }
                aria-label={equal ? `${key} matches` : `${key} differs`}
              >
                {equal ? "✓" : "≠"}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
