import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { code, python, parseInput, buildTrace } from "./algorithm.js";
import FlipCounterView from "./FlipCounterView";

const definition = {
  number: "3094",
  phases: [
    { id: "start", label: "Setup", description: "Learn the starting count of one bits." },
    { id: "probe", label: "Probe", description: "The count rose: this bit was zero." },
    { id: "set", label: "Set", description: "The count dropped: this bit was one." },
    { id: "done", label: "Result", description: "Return the original number." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "Hidden 30-bit integer n as JSON",
  url: "https://leetcode.com/problems/guess-the-number-using-bitwise-questions-ii/",
  complexity: "O(30) oracle calls and O(1) extra space for a 30-bit number. The oracle mutates the hidden value, so the algorithm uses only the counts it returns.",
  examples: [
    { label: "Some bits set", input: "1024" },
    { label: "Every bit set", input: "1073741823" },
    { label: "Zero", input: "0" },
    { label: "Single bit", input: "1" },
    { label: "All bits except the lowest", input: "1073741822" },
    { label: "Alternating bits", input: "715827882" },
    { label: "Long run: 30-bit value", input: "987654321" },
  ],
};

export default function Problem3094Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <FlipCounterView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
