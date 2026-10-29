import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import { SameTreeScene } from "./SameTreeVisualizer";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";
import "./SameTreeVisualizer.css";

const definition = {
  phases: [
    { id: "start", label: "Start", description: "Begin the simultaneous walk from both roots." },
    { id: "check", label: "Position", description: "Look at the same position in both trees." },
    { id: "both-empty", label: "Both empty", description: "Both positions are empty, so they match." },
    { id: "one-empty", label: "One empty", description: "Exactly one position is empty, so the trees differ." },
    { id: "mismatch", label: "Mismatch", description: "The values differ, so the answer is false." },
    { id: "match", label: "Values match", description: "The values match; check the children next." },
    { id: "left", label: "Left", description: "Compare the left children." },
    { id: "right", label: "Right", description: "Compare the right children." },
    { id: "return", label: "Return", description: "Combine the child results." },
    { id: "done", label: "Result", description: "Report whether the trees are the same." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Level-order arrays p and q (e.g. {"p":[1,2,3],"q":[1,2,3]})',
  url: "https://leetcode.com/problems/same-tree/",
  complexity: "O(min(n, m)) time and O(h) recursion depth for the two trees. The visualization accepts up to 15 entries per tree.",
  examples: getExamples("same-tree").map(example => ({ label: example.label, input: JSON.stringify({ p: example.p, q: example.q }) })),
};

export default function SameTreeWorkspace() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => <SameTreeScene step={step} />}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
