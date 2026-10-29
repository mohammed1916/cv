import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamplesOr } from "../../config/examplesRegistry";
import CycleStory from "./CycleStory";
import { code, python, parseInput, buildTrace, pythonLineMap } from "./algorithm";
import "./LinkedListCycleVisualizer.css";

const definition = {
  phases: [
    { id: "init", label: "Setup", description: "Start slow and fast pointers at the head." },
    { id: "check", label: "Check", description: "Test whether fast can keep moving." },
    { id: "move_slow", label: "Move slow", description: "Advance slow one node." },
    { id: "move_fast", label: "Move fast", description: "Advance fast two nodes." },
    { id: "compare", label: "Compare", description: "Check whether the pointers meet." },
    { id: "done", label: "Result", description: "Report whether a cycle exists." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Values | pos (e.g. "[3, 2, 0, -4] | pos = 1")',
  url: "https://leetcode.com/problems/linked-list-cycle/",
  complexity: "O(n) time and O(1) extra space for n nodes. The visualization caps the list at 500 nodes; the official limit is 10,000.",
  examples: getExamplesOr("linked-list-cycle", []).map((example) => ({
    label: example.label,
    input: example.input ?? JSON.stringify(example.values ?? { nodes: example.nodes, pos: example.pos }),
  })),
};

export default function LinkedListCycleVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <CycleStory story={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
