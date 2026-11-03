import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { code, python, parseInput, buildTrace } from "./algorithm.js";
import FrequencyListView from "./FrequencyListView";

const definition = {
  number: "3063",
  phases: [
    { id: "start", label: "Setup", description: "Start with empty structures." },
    { id: "count", label: "Count", description: "Add one to a value count." },
    { id: "build", label: "Build", description: "Append a count node." },
    { id: "done", label: "Result", description: "Return the new list." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "JSON array of integers",
  url: "https://leetcode.com/problems/linked-list-frequency/",
  complexity: "O(n) time and O(n) extra space for n nodes using a hash map. The visualization caps the list at 16 nodes with digits 0 to 9.",
  examples: [
    { label: "Mixed counts", input: "[3, 1, 3, 2, 1, 3]" },
    { label: "Single node", input: "[7]" },
    { label: "Long run", input: "[0, 0, 0, 0, 5, 5]" },
  ],
};

export default function Problem3063Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <FrequencyListView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
