import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import MirrorTreeStory from "./MirrorTreeStory";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";
import "./SymmetricTreeVisualizer.css";

const definition = {
  phases: [
    { id: "start", label: "Root", description: "Start with the root's left and right children." },
    { id: "both-empty", label: "Both empty", description: "Both positions are empty, so they mirror each other." },
    { id: "check", label: "One empty", description: "Check whether exactly one of the two positions is empty." },
    { id: "mismatch", label: "Mismatch", description: "The pair cannot mirror, so the answer is false." },
    { id: "compare", label: "Values", description: "Compare the values of the two positions." },
    { id: "pair", label: "Pairs", description: "Compare the outer pair, then the inner pair." },
    { id: "done", label: "Result", description: "Report whether the tree is symmetric." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Level-order array (e.g. [1,2,2,3,4,4,3])",
  url: "https://leetcode.com/problems/symmetric-tree/",
  complexity: "O(n) time and O(h) recursion depth for n nodes. The visualization accepts up to 15 entries.",
  examples: getExamples("symmetric-tree").map(example => ({ label: example.label, input: JSON.stringify(example.tree) })),
};

export default function SymmetricTreeWorkspace() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <MirrorTreeStory positions={step.positions} edges={step.edges} nodes={step.nodes}
          activeLeftId={step.activeLeftId} activeRightId={step.activeRightId} nodeStates={step.nodeStates} />
      )}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
