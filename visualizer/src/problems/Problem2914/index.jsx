import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2914",
  phases: [
    { id: "setup", label: "Setup", description: "Start with zero changes." },
    { id: "pair", label: "Pairs", description: "Check each pair of characters that starts at an even index." },
    { id: "result", label: "Result", description: "Report the number of mismatched pairs." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with key s (e.g. {"s": "1001"})',
  url: "https://leetcode.com/problems/minimum-number-of-changes-to-make-binary-string-beautiful/",
  complexity: "O(n) time and O(1) extra space for string length n. The visualization caps s at 50 characters.",
  examples: [
    { label: "Example 1", input: '{"s": "1001"}' },
    { label: "Example 2", input: '{"s": "10"}' },
    { label: "Example 3", input: '{"s": "0000"}' },
  ],
};

export default function Problem2914() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => <>
      <IndexedSequence label="s" length={step.values.length} valueAt={i => step.values[i]}
        active={step.active} roleAt={i => step.marks[i] || ""} />
      <p>{step.summary}</p>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>} />;
}
