import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2843",
  phases: [
    { id: "setup", label: "Setup", description: "Start the count." },
    { id: "scan", label: "Scan", description: "Check each number." },
    { id: "count", label: "Count", description: "Count a symmetric number." },
    { id: "result", label: "Result", description: "Report the count." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "low and high (e.g. {\"low\": 1, \"high\": 100})",
  url: "https://leetcode.com/problems/count-symmetric-integers/",
  complexity: "O((high - low) * digits) time and O(1) extra space. The visualization caps the range at 120 numbers.",
  examples: [
    { label: "Example 1", input: "{\"low\": 1, \"high\": 100}" },
    { label: "Example 2", input: "{\"low\": 1200, \"high\": 1230}" },
  ],
};

export default function Problem2843Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <IndexedSequence
          label="numbers in range"
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
