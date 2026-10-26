import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useProblemDescription } from "../hooks/useProblemDescription";
import { isPremiumProblem } from "../data/premiumProblems";
import "./ProblemInfoPanel.css";

function isLeetCodeProblem(slug, number) {
  if (!slug) return false;
  if (
    typeof number === "string" &&
    (number.startsWith("CF-") || number.startsWith("B") || number === "CF-F")
  ) {
    return false;
  }
  if (
    slug === "matrix-iteration-patterns" ||
    slug === "matrix-iteration-basics" ||
    slug === "game-on-growing-tree"
  ) {
    return false;
  }
  return true;
}

export default function ProblemInfoPanel({ slug, number, before, after }) {
  const [open, setOpen] = useState(false);

  const premium = isPremiumProblem(number);
  const { description: info } = useProblemDescription(slug);
  const summaryText = info?.content || "";
  const isLeetCode = isLeetCodeProblem(slug, number);

  // Available if we have a summary or it's a LeetCode problem
  const available = Boolean(summaryText || isLeetCode);

  return (
    <>
      {/* Toggle bar */}
      <div className="problem-info-bar">
        {before}
        {available && (
          <button
            className={`problem-info-toggle${open ? " open" : ""}`}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="problem-description"
            title={
              open ? "Hide problem description" : "Show problem description"
            }
          >
            {/* book icon */}
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            Problem
            {/* chevron */}
            <svg
              className="chevron"
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        )}
        {after}
      </div>

      {/* Expandable panel */}
      <AnimatePresence initial={false}>
        {open && available && (
          <motion.div
            id="problem-description"
            className="problem-info-panel"
            key="info-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <div className="problem-info-inner">
              {summaryText && (
                <div className="problem-info-summary">
                  <p>{summaryText}</p>
                </div>
              )}
              {isLeetCode && (
                <div className="problem-info-meta-row">
                  <a
                    href={`https://leetcode.com/problems/${slug}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="problem-info-leetcode-link"
                  >
                    View original problem on LeetCode ↗
                  </a>
                  {premium && (
                    <span className="problem-info-premium-badge">
                      LeetCode Premium
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
