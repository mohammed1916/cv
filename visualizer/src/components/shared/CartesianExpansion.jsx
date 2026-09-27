import { AnimatePresence, motion } from "framer-motion";
import "./CartesianExpansion.css";

function displayWord(value) {
  return value === "" ? "ε" : value;
}

function TokenSet({ values = [], emptyLabel = "∅" }) {
  if (!values.length) {
    return <div className="cartesian-expansion-empty-set">{emptyLabel}</div>;
  }

  return (
    <div className="cartesian-expansion-token-set">
      {values.map((value, index) => (
        <span
          key={`${value || "__epsilon__"}-${index}`}
          className="cartesian-expansion-token"
        >
          {displayWord(value)}
        </span>
      ))}
    </div>
  );
}

export default function CartesianExpansion({
  left = [],
  right = [],
  result = [],
  leftTitle = "Left values",
  rightTitle = "Right values",
  resultTitle = "Result",
  leftDescription = "",
  rightDescription = "",
  operationLabel = "combine",
  leftItemName = "left value",
  rightItemName = "right value",
  resultItemName = "result",
  combine = (a, b) => `${a}${b}`,
  emptyLabel = "No Cartesian-product operation at this step.",
}) {
  if (!left.length || !right.length) {
    return <div className="cartesian-expansion-empty">{emptyLabel}</div>;
  }

  return (
    <motion.div
      className="cartesian-expansion"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="cartesian-expansion-summary">
        <div className="cartesian-expansion-side">
          <div className="cartesian-expansion-side-heading">
            <strong>{leftTitle}</strong>
            <span>{left.length}</span>
          </div>

          {leftDescription && <p>{leftDescription}</p>}

          <TokenSet values={left} />
        </div>

        <div className="cartesian-expansion-times">
          <strong>×</strong>
          <span>every pair</span>
        </div>

        <div className="cartesian-expansion-side">
          <div className="cartesian-expansion-side-heading">
            <strong>{rightTitle}</strong>
            <span>{right.length}</span>
          </div>

          {rightDescription && <p>{rightDescription}</p>}

          <TokenSet values={right} />
        </div>
      </div>

      <div className="cartesian-expansion-explanation">
        For each <strong>{leftItemName}</strong>, take every{" "}
        <strong>{rightItemName}</strong> and {operationLabel} it.
      </div>

      <div className="cartesian-expansion-groups">
        <AnimatePresence initial={false}>
          {left.map((leftValue, leftIndex) => (
            <motion.div
              layout
              key={`${leftValue || "__epsilon__"}-${leftIndex}`}
              className="cartesian-expansion-group"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="cartesian-expansion-prefix">
                <span>{leftItemName}</span>
                <strong>{displayWord(leftValue)}</strong>
              </div>

              <div className="cartesian-expansion-combinations">
                {right.map((rightValue, rightIndex) => {
                  const combined = combine(leftValue, rightValue);

                  return (
                    <motion.div
                      layout
                      key={`${rightValue || "__epsilon__"}-${rightIndex}`}
                      className="cartesian-expansion-combination"
                    >
                      <span className="cartesian-expansion-source">
                        {displayWord(leftValue)}
                      </span>

                      <span className="cartesian-expansion-action">
                        {operationLabel}
                      </span>

                      <span className="cartesian-expansion-source">
                        {displayWord(rightValue)}
                      </span>

                      <span className="cartesian-expansion-arrow">→</span>

                      <strong className="cartesian-expansion-combined">
                        {displayWord(combined)}
                      </strong>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="cartesian-expansion-result">
        <div className="cartesian-expansion-result-heading">
          <div>
            <strong>{resultTitle}</strong>
            <span>
              Each generated {resultItemName} becomes part of the new set.
            </span>
          </div>

          <span className="cartesian-expansion-result-count">
            {result.length}
          </span>
        </div>

        <TokenSet values={result} />
      </div>
    </motion.div>
  );
}
