import React, { useEffect, useMemo, useState } from "react";

import WeightedComparisonGraph from "./WeightedComparisonGraph";

/**
 * WeightedComparison
 *
 * High-level wrapper around WeightedComparisonGraph.
 *
 * Example:
 *
 * <WeightedComparison
 *   operands={[
 *     {
 *       id: 'lo',
 *       label: 'nums[lo]',
 *       value: 4,
 *       tone: 'lo',
 *     },
 *     {
 *       id: 'target',
 *       label: 'target',
 *       value: 0,
 *       tone: 'target',
 *     },
 *     {
 *       id: 'mid',
 *       label: 'nums[mid]',
 *       value: 7,
 *       tone: 'mid',
 *     },
 *   ]}
 *   operators={['<=', '<']}
 *   title="Is target inside the sorted half?"
 * />
 */
export default function WeightedComparison({
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
  onResultChange,
}) {
  const [currentOperands, setCurrentOperands] = useState(operands);

  useEffect(() => {
    setCurrentOperands(operands);
  }, [operands]);

  const calculatedResult = useMemo(() => {
    if (typeof result === "boolean") {
      return result;
    }

    if (currentOperands.length < 2 || operators.length === 0) {
      return false;
    }

    const compare = (left, operator, right) => {
      const a = Number(left);

      const b = Number(right);

      if (!Number.isFinite(a) || !Number.isFinite(b)) {
        return false;
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

        case "=":
        case "==":
        case "===":
          return a === b;

        case "!=":
        case "!==":
        case "≠":
          return a !== b;

        default:
          return false;
      }
    };

    return operators.every((operator, index) => {
      const left = currentOperands[index];

      const right = currentOperands[index + 1];

      if (!left || !right) {
        return false;
      }

      return compare(left.value, operator, right.value);
    });
  }, [currentOperands, operators, result]);

  useEffect(() => {
    if (onResultChange) {
      onResultChange(calculatedResult);
    }
  }, [calculatedResult, onResultChange]);

  return (
    <WeightedComparisonGraph
      operands={currentOperands}
      operators={operators}
      result={calculatedResult}
      title={title}
      subtitle={subtitle}
      label={label}
      className={className}
      minHeight={minHeight}
      maxHeight={maxHeight}
      showScale={showScale}
      showPairResults={showPairResults}
      showOverallResult={showOverallResult}
      showExpression={showExpression}
      animate={animate}
    />
  );
}

export { WeightedComparisonGraph };
