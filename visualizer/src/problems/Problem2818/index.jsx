import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2818",
  phases: [
    { id: "setup", label: "Setup", description: "Prepare the arrays." },
    { id: "score", label: "Prime scores", description: "Count distinct prime factors." },
    { id: "left", label: "Left bound", description: "Nearest left index with score at least as large." },
    { id: "right", label: "Right bound", description: "Nearest right index with strictly larger score." },
    { id: "order", label: "Order", description: "Sort by value, largest first." },
    { id: "pick", label: "Spend operations", description: "Multiply by each value up to its win count." },
    { id: "result", label: "Result", description: "Report the maximum score." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "nums and k (e.g. {\"nums\": [8,3,9,3,8], \"k\": 2})",
  url: "https://leetcode.com/problems/apply-operations-to-maximize-score/",
  complexity: "O(n sqrt(max) + n log n) time and O(n) space. The visualization caps n at 50 items.",
  examples: [
    { label: "Example 1", input: "{\"nums\": [8, 3, 9, 3, 8], \"k\": 2}" },
    { label: "Example 2", input: "{\"nums\": [19, 12, 14, 6, 10, 18], \"k\": 3}" },
  ],
};

export default function Problem2818Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <IndexedSequence
          label="nums"
          length={step.values.length}
          valueAt={i => String(step.values[i])}
          active={step.active ?? -1}
          roleAt={i => step.roles?.[i] ?? ""}
        />
      )}
      renderReasoning={({ step }) => <p>{step.detail}</p>}
    />
  );
}
