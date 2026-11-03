import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import OddSumParityView from "./OddSumParityView";
import { code, python, parseInput, buildTrace } from "./algorithm.js";

const definition = {
  number: "3247",
  phases: [
    { id: "start", label: "Start", description: "The empty subsequence is the only starting subset." },
    { id: "decide", label: "Check parity", description: "Decide how the next value changes the parity counts." },
    { id: "update", label: "Update", description: "Apply the parity rule and keep both counts modulo 1000000007." },
    { id: "done", label: "Answer", description: "Report the odd-sum count." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "Array of non-negative integers (e.g. [1,2,3])",
  url: "https://leetcode.com/problems/number-of-subsequences-with-odd-sum/",
  complexity: "O(n) time and O(1) extra space: each element updates two counters. The visualization accepts up to 16 values from 0 to 1000 so the trace stays readable.",
  examples: [
    { label: "Mixed parities", input: "[1,2,3]" },
    { label: "All even", input: "[2,4,6]" },
    { label: "Single odd", input: "[7]" },
  ],
};

export default function NumberOfSubsequencesWithOddSum() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <OddSumParityView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Final count: ${run.result}.` : ""}
        </p>
      )}
    />
  );
}
