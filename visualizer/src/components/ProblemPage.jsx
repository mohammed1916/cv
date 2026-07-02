import { useEffect } from "react";
import { motion } from "framer-motion";
import ErrorBoundary from "./ErrorBoundary";
import LayoutControls from "./LayoutControls";
import ProblemScaffold from "./panels/ProblemScaffold";
import ProblemInfoPanel, { getProblemDescriptionText } from "./ProblemInfoPanel";
import { useVisualizationContext } from "../context/VisualizationContext";

export default function ProblemPage({ problem, onBack, layoutWidth, onLayoutChange, problemDescriptions }) {
  const Component = problem.component;
  const { publishDescription } = useVisualizationContext();

  // Publish plain-text description so the chatbot can use it
  useEffect(() => {
    const text = getProblemDescriptionText(problem.slug, problemDescriptions);
    publishDescription(text);
    return () => publishDescription(null);
  }, [problem.slug, problemDescriptions, publishDescription]);

  return (
    <motion.div
      className="problem-page"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ type: "spring", stiffness: 320, damping: 35 }}
    >
      <header className="problem-header">
        <button className="back-btn" onClick={onBack}>
          <svg
            className="back-btn-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M13 8l-4 4 4 4" />
          </svg>
          Problems
        </button>
        <div className="problem-title-group">
          <span className="problem-num">#{problem.number}</span>
          <h1 className="problem-title">{problem.title}</h1>
        </div>
        <span
          className={`difficulty badge difficulty-${problem.difficulty.toLowerCase()}`}
        >
          {problem.difficulty}
        </span>
        <LayoutControls
          layoutWidth={layoutWidth}
          onChange={onLayoutChange}
          compact
        />
      </header>
      <ProblemInfoPanel slug={problem.slug} descriptions={problemDescriptions} />
      <div className="problem-content" data-visualizer-root>
        <ErrorBoundary key={problem.id}>
          {Component ? (
            <Component problem={problem} />
          ) : (
            <ProblemScaffold problem={problem} />
          )}
        </ErrorBoundary>
      </div>
    </motion.div>
  );
}


