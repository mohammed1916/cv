import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamplesOr } from "../../config/examplesRegistry";
import Cycle2Story from "./Cycle2Story";
import { code, python, parseInput, buildTrace } from "./algorithm";
import "./LinkedListCycleIIVisualizer.css";

const definition = {
  phases: [
    { id: "init", label: "Setup", description: "Start the two pointers at the head." },
    { id: "phase1", label: "Phase 1", description: "Detect whether the pointers meet inside the cycle." },
    { id: "phase2", label: "Phase 2", description: "Restart one pointer at the head and find the entry." },
    { id: "done", label: "Result", description: "Report the cycle entry node." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Values | pos (e.g. "[3, 2, 0, -4] | pos = 1")',
  url: "https://leetcode.com/problems/linked-list-cycle-ii/",
  complexity: "O(n) time and O(1) extra space for n nodes. The visualization caps the list at 40 nodes; the official limit is 10,000.",
  examples: getExamplesOr("linked-list-cycle-ii", []).map((example) => ({
    label: example.label,
    input: example.input ?? JSON.stringify(example.values ?? { nodes: example.nodes, pos: example.pos }),
  })),
};

export default function LinkedListCycleIIVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <Cycle2Story story={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
