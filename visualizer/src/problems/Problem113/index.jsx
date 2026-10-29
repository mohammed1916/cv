import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import { TreeVisualizationPanel, StatePanel } from "./PathSumIIVisualizer";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";
import "./PathSumIIVisualizer.css";

const definition = {
  phases: [
    { id: "init", label: "Setup", description: "Start with an empty result and an empty working path." },
    { id: "null", label: "Empty", description: "An empty position ends this route." },
    { id: "visit", label: "Extend", description: "Add the node's value to the working path." },
    { id: "leaf", label: "Leaf", description: "A leaf is checked against the remaining target." },
    { id: "match", label: "Save", description: "A leaf that leaves zero saves a copy of the path." },
    { id: "no-match", label: "No match", description: "A leaf that misses the target is not saved." },
    { id: "branch", label: "Left", description: "Walk the left child with the remaining target." },
    { id: "no-left", label: "Right", description: "Skip the missing left child and walk the right child." },
    { id: "no-right", label: "Left only", description: "Skip the missing right child and walk the left child." },
    { id: "backtrack", label: "Backtrack", description: "Remove the last value from the working path." },
    { id: "done", label: "Result", description: "Return every saved route." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Object with root and target_sum (e.g. {"root":[5,4,8,11,null,13,4],"target_sum":22})',
  url: "https://leetcode.com/problems/path-sum-ii/",
  complexity: "O(n^2) time in the worst case for copying saved routes, and O(h) recursion depth for n nodes. The visualization accepts up to 15 entries.",
  examples: getExamples("path-sum-ii").map(example => ({ label: example.label, input: JSON.stringify({ root: example.root, target_sum: example.targetSum }) })),
};

export default function PathSumIIWorkspace() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => <TreeVisualizationPanel step={step} positions={step.positions} edges={step.edges} allNodes={step.allNodes} />}
      renderReasoning={({ step }) => <StatePanel step={step} />}
    />
  );
}
