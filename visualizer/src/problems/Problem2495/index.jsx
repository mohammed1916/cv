import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import EvenEndingsView from "./EvenEndingsView";
import { buildTrace, code, parseInput, phases, python } from "./algorithm.js";

const definition = {
  number: "2495",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "Array of positive integers (e.g. [9,6,7,13])",
  url: "https://leetcode.com/problems/number-of-subarrays-having-even-product/description/",
  complexity: "O(n) time and O(1) extra space. The visualization caps the array at 12 values from 1 to 20 to keep the trace short.",
  examples: [
    { label: "Mixed", input: "[5,8,3,4]" },
    { label: "All odd", input: "[1,3,5]" },
    { label: "Even first", input: "[2,1,1]" },
  ],
};

export default function NumberSubarraysEvenProduct() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <EvenEndingsView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          A subarray product is even exactly when the subarray contains an even value. Scanning left to right, each index ends the subarrays that start at or before the most recent even value.
          {run ? ` Final answer: ${run.result}.` : ""} {step.message}
        </p>
      )}
    />
  );
}
