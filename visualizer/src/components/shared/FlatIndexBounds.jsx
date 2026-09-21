import { motion } from "framer-motion";
import "./FlatIndexBounds.css";

export default function FlatIndexBounds({
  length = 0,

  lo = 0,
  hi = -1,
  mid = -1,

  values = [],

  label = "Flattened search space",

  loLabel = "lo",
  midLabel = "mid",
  hiLabel = "hi",

  showValues = true,
  showIndices = true,

  eliminatedStart = null,
  eliminatedEnd = null,

  className = "",
}) {
  if (length <= 0) {
    return null;
  }

  const safeLength = Math.max(1, length);

  const toPercent = (index) => {
    if (safeLength <= 1) {
      return 50;
    }

    return (index / (safeLength - 1)) * 100;
  };

  const validWindow = lo >= 0 && hi >= 0 && lo <= hi && lo < length;

  const validMid = mid >= 0 && mid < length;

  const loPercent = toPercent(Math.max(0, Math.min(length - 1, lo)));

  const hiPercent = toPercent(Math.max(0, Math.min(length - 1, hi)));

  const midPercent = validMid ? toPercent(mid) : null;

  return (
    <section
      className={`flat-index-bounds ${className}`.trim()}
      aria-label={label}
    >
      <div className="flat-index-bounds__head">
        <span className="flat-index-bounds__title">{label}</span>

        <span className="flat-index-bounds__range">
          {validWindow ? `[${lo}..${hi}]` : "empty"}
        </span>
      </div>

      <div className="flat-index-bounds__stage">
        {validWindow && (
          <motion.div
            className="flat-index-bounds__bracket"
            initial={false}
            animate={{
              left: `${loPercent}%`,

              width: `${Math.max(0, hiPercent - loPercent)}%`,
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 28,
            }}
          >
            <span className="flat-index-bounds__bracket-label">
              active search window
            </span>
          </motion.div>
        )}

        <div className="flat-index-bounds__track">
          {Array.from(
            {
              length: safeLength,
            },
            (_, index) => {
              const isLo = validWindow && index === lo;

              const isHi = validWindow && index === hi;

              const isMid = validMid && index === mid;

              const inRange = validWindow && index >= lo && index <= hi;

              const explicitlyEliminated =
                eliminatedStart !== null &&
                eliminatedEnd !== null &&
                index >= eliminatedStart &&
                index <= eliminatedEnd;

              const classes = [
                "flat-index-bounds__slot",

                inRange ? "is-in-range" : "",

                !inRange ? "is-out" : "",

                isLo ? "is-lo" : "",

                isMid ? "is-mid" : "",

                isHi ? "is-hi" : "",

                explicitlyEliminated ? "is-eliminated" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <div key={index} className={classes}>
                  {showValues && (
                    <span className="flat-index-bounds__value">
                      {values[index] ?? ""}
                    </span>
                  )}

                  {showIndices && (
                    <span className="flat-index-bounds__index">{index}</span>
                  )}

                  <div className="flat-index-bounds__pointers">
                    {isLo && (
                      <span className="flat-index-bounds__pointer is-lo">
                        {loLabel}
                      </span>
                    )}

                    {isMid && (
                      <span className="flat-index-bounds__pointer is-mid">
                        {midLabel}
                      </span>
                    )}

                    {isHi && (
                      <span className="flat-index-bounds__pointer is-hi">
                        {hiLabel}
                      </span>
                    )}
                  </div>
                </div>
              );
            },
          )}
        </div>

        {validMid && (
          <motion.div
            className="flat-index-bounds__mid-line"
            initial={false}
            animate={{
              left: `${midPercent}%`,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          >
            <span />
          </motion.div>
        )}
      </div>
    </section>
  );
}
