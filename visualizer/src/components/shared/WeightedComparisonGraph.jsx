import { useId, useMemo } from "react";
import { motion } from "framer-motion";
import "./WeightedComparison.css";

/**
 * WeightedComparisonGraph
 *
 * Generic weighted / piston-style numeric comparison visualisation.
 *
 * Each operand:
 *
 * {
 *   id: 'lo',
 *   label: 'nums[lo]',
 *   value: 4,
 *   tone: 'lo',
 *   sublabel: 'index 0'
 * }
 *
 * Operators:
 *
 * ['<=', '<']
 *
 * Example:
 *
 * operands={[
 *   { id: 'lo', label: 'nums[lo]', value: 4, tone: 'lo' },
 *   { id: 'target', label: 'target', value: 0, tone: 'target' },
 *   { id: 'mid', label: 'nums[mid]', value: 7, tone: 'mid' },
 * ]}
 *
 * operators={['<=', '<']}
 *
 * Heights are NORMALIZED.
 *
 * Value 900 does not create a 900px piston.
 * Relative numeric magnitude determines vertical position.
 */
export default function WeightedComparisonGraph({
  operands = [],
  operators = [],
  result,
  title = "Comparison",
  subtitle = "",
  label = "Weighted comparison",
  className = "",
  minHeight = 26,
  maxHeight = 132,
  showScale = true,
  showPairResults = true,
  showOverallResult = true,
  showExpression = true,
  animate = true,
}) {
  const uid = useId().replace(/:/g, "");

  const numericValues = useMemo(
    () =>
      operands
        .map((operand) => Number(operand.value))
        .filter((value) => Number.isFinite(value)),
    [operands],
  );

  const minValue = numericValues.length ? Math.min(...numericValues) : 0;

  const maxValue = numericValues.length ? Math.max(...numericValues) : 0;

  const valueRange = maxValue - minValue;

  const normalizeHeight = (rawValue) => {
    const value = Number(rawValue);

    if (!Number.isFinite(value)) {
      return minHeight;
    }

    if (valueRange === 0) {
      return (minHeight + maxHeight) / 2;
    }

    const ratio = (value - minValue) / valueRange;

    return minHeight + ratio * (maxHeight - minHeight);
  };

  const normalizeOperator = (operator) => {
    switch (operator) {
      case "<=":
        return "≤";

      case ">=":
        return "≥";

      case "==":
      case "===":
        return "=";

      case "!=":
      case "!==":
        return "≠";

      default:
        return operator;
    }
  };

  const evaluatePair = (left, operator, right) => {
    const a = Number(left);
    const b = Number(right);

    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      return null;
    }

    switch (operator) {
      case "<":
        return a < b;

      case "<=":
      case "≤":
        return a <= b;

      case ">":
        return a > b;

      case ">=":
      case "≥":
        return a >= b;

      case "==":
      case "===":
      case "=":
        return a === b;

      case "!=":
      case "!==":
      case "≠":
        return a !== b;

      default:
        return null;
    }
  };

  const pairResults = useMemo(() => {
    return operators.map((operator, index) => {
      const left = operands[index];

      const right = operands[index + 1];

      if (!left || !right) {
        return null;
      }

      return evaluatePair(left.value, operator, right.value);
    });
  }, [operands, operators]);

  const calculatedOverallResult =
    pairResults.length > 0 &&
    pairResults.every((pairResult) => pairResult === true);

  const overallResult =
    typeof result === "boolean" ? result : calculatedOverallResult;

  const displayOperator = (index) => normalizeOperator(operators[index] ?? "");

  if (!operands.length) {
    return (
      <div
        className={`weighted-comparison weighted-comparison--empty ${className}`.trim()}
        role="region"
        aria-label={label}
      >
        <div className="weighted-comparison__empty">No comparison values.</div>
      </div>
    );
  }

  return (
    <div
      className={`weighted-comparison ${className}`.trim()}
      role="region"
      aria-label={label}
      tabIndex={0}
    >
      {(title || subtitle) && (
        <div className="weighted-comparison__header">
          {title && <div className="weighted-comparison__title">{title}</div>}

          {subtitle && (
            <div className="weighted-comparison__subtitle">{subtitle}</div>
          )}
        </div>
      )}

      <div className="weighted-comparison__machine">
        {showScale && (
          <div className="weighted-comparison__scale">
            <span className="weighted-comparison__scale-high">HIGH</span>

            <div className="weighted-comparison__scale-line" />

            <span className="weighted-comparison__scale-low">LOW</span>
          </div>
        )}

        <div className="weighted-comparison__pistons">
          {operands.map((operand, index) => {
            const height = normalizeHeight(operand.value);

            const tone = operand.tone ?? "default";

            return (
              <div
                key={operand.id ?? `${uid}-${index}`}
                className="weighted-comparison__piston-column"
              >
                <div className="weighted-comparison__piston-track">
                  <motion.div
                    className={[
                      "weighted-comparison__piston",
                      `weighted-comparison__piston--${tone}`,
                      operand.active ? "is-active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    initial={
                      animate
                        ? {
                            height: minHeight,
                          }
                        : false
                    }
                    animate={{
                      height,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 220,
                      damping: 24,
                    }}
                  >
                    <motion.div
                      className="weighted-comparison__weight"
                      initial={
                        animate
                          ? {
                              opacity: 0,
                              scale: 0.85,
                            }
                          : false
                      }
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      transition={{
                        duration: 0.2,
                      }}
                    >
                      <span className="weighted-comparison__weight-value">
                        {String(operand.value)}
                      </span>
                    </motion.div>

                    <div className="weighted-comparison__rod" />
                  </motion.div>
                </div>

                <div className="weighted-comparison__base">
                  <div className="weighted-comparison__base-cap" />
                </div>

                <div className="weighted-comparison__operand-label">
                  {operand.label ?? operand.id ?? `value ${index + 1}`}
                </div>

                {operand.sublabel && (
                  <div className="weighted-comparison__operand-sublabel">
                    {operand.sublabel}
                  </div>
                )}

                <div className="weighted-comparison__operand-value">
                  {String(operand.value)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showExpression && (
        <div className="weighted-comparison__expression">
          {operands.map((operand, index) => (
            <div
              key={`expression-${operand.id ?? index}`}
              className="weighted-comparison__expression-group"
            >
              <div className="weighted-comparison__expression-operand">
                <span className="weighted-comparison__expression-value">
                  {String(operand.value)}
                </span>

                <span className="weighted-comparison__expression-label">
                  {operand.label ?? operand.id ?? ""}
                </span>
              </div>

              {index < operands.length - 1 && (
                <div className="weighted-comparison__operator-block">
                  <span className="weighted-comparison__operator">
                    {displayOperator(index)}
                  </span>

                  {showPairResults && (
                    <motion.span
                      key={`${uid}-pair-${index}-${pairResults[index]}`}
                      className={[
                        "weighted-comparison__pair-result",
                        pairResults[index] === true ? "is-true" : "",
                        pairResults[index] === false ? "is-false" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      initial={
                        animate
                          ? {
                              opacity: 0,
                              y: -4,
                            }
                          : false
                      }
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                    >
                      {pairResults[index] === true
                        ? "✓"
                        : pairResults[index] === false
                          ? "✕"
                          : "·"}
                    </motion.span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showOverallResult && (
        <motion.div
          key={`${uid}-overall-${overallResult}`}
          className={[
            "weighted-comparison__overall",
            overallResult ? "is-true" : "is-false",
          ].join(" ")}
          initial={
            animate
              ? {
                  opacity: 0,
                  y: 5,
                }
              : false
          }
          animate={{
            opacity: 1,
            y: 0,
          }}
        >
          <span className="weighted-comparison__overall-icon">
            {overallResult ? "✓" : "✕"}
          </span>

          <span className="weighted-comparison__overall-text">
            {overallResult ? "TRUE" : "FALSE"}
          </span>
        </motion.div>
      )}
    </div>
  );
}
