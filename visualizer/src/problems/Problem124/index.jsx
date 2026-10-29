import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import MaxPathStory from "./MaxPathStory";
import { code, python, parseInput, buildTrace, pythonLineMap } from "./algorithm";
import "./BTMaxPathVisualizer.css";

const definition = {
  phases: [
    { id: "init", label: "Setup", description: "Build the tree from its level-order array." },
    { id: "visit", label: "Visit", description: "Visit the next node in level order." },
    { id: "recurse", label: "Descend", description: "Recurse into a child subtree." },
    { id: "compute", label: "Compute", description: "Combine the child gains at this node." },
    { id: "combine", label: "Combine", description: "Combine the left and right gains." },
    { id: "update", label: "Update", description: "Record a better path sum through this node." },
    { id: "return", label: "Return", description: "Return the best one-sided gain upward." },
    { id: "done", label: "Result", description: "Report the maximum path sum." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Level-order tree (JSON object, e.g. {\"root\": [-10,9,20,null,null,15,7]})",
  url: "https://leetcode.com/problems/binary-tree-maximum-path-sum/",
  complexity: "O(n) time and O(n) space for n nodes. The visualization caps the array at 60 slots.",
  examples: getExamples("binary-tree-maximum-path-sum").map(({ label, input }) => ({ label, input: JSON.stringify({ root: JSON.parse(input) }) })),
};

export default function BTMaxPathVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <MaxPathStory story={run} step={step} stepIndex={Math.max(0, run.frames.indexOf(step))} />
      )}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
