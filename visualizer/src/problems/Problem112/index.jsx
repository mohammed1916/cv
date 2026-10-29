import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import authoredExamples from "../../config/examples/path-sum.js";
import PathSumStory from "./PathSumStory";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";
import "./PathSumVisualizer.css";

const definition = {
  phases: [
    { id: "init", label: "Setup", description: "Look for a root-to-leaf route that totals the target." },
    { id: "visit", label: "Subtract", description: "Subtract the node value from the remaining target." },
    { id: "descend", label: "Descend", description: "Walk into the next child with the remaining target." },
    { id: "backtrack", label: "Backtrack", description: "Return to the parent and try its other child." },
    { id: "reject", label: "Not a leaf match", description: "A leaf does not finish the target, so the route fails." },
    { id: "found", label: "Match", description: "A leaf leaves exactly zero: the route is a match." },
    { id: "done", label: "Result", description: "Report whether any route reaches the target." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Object with root and target_sum (e.g. {"root":[5,4,8,11,null,13,4],"target_sum":22})',
  url: "https://leetcode.com/problems/path-sum/",
  complexity: "O(n) time and O(h) recursion depth for n nodes. The visualization accepts up to 15 entries.",
  examples: authoredExamples.map(example => ({ label: example.label, input: JSON.stringify({ root: example.root, target_sum: example.targetSum }) })),
};

export default function PathSumWorkspace() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <PathSumStory run={run} stepIndex={step.index} />}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
