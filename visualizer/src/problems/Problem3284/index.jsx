import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import RunStripView from "./RunStripView";
import { code, python, parseInput, buildTrace } from "./algorithm.js";

const definition = {
  number: "3284",
  phases: [
    { id: "start", label: "Singletons", description: "Each single element is a consecutive subarray." },
    { id: "diff", label: "Step", description: "Compare the new neighbour with the previous one." },
    { id: "add", label: "Add runs", description: "Add the sums of the runs that end at this position." },
    { id: "done", label: "Result", description: "Report the total modulo 1000000007." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "JSON array of integers (e.g. [1,2,3,2])",
  url: "https://leetcode.com/problems/sum-of-consecutive-subarrays/",
  complexity: "O(n) time and O(1) extra space: each position updates two running runs. The visualization accepts up to 12 values from -100 to 100 so every intermediate sum is exact.",
  examples: [
    { label: "Rising then falling", input: "[1,2,3,2]" },
    { label: "Break in the run", input: "[5,4,9,10]" },
    { label: "Single value", input: "[7]" },
  ],
};

export default function SumOfConsecutiveSubarrays() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <RunStripView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Result: ${run.result}.` : ""}
        </p>
      )}
    />
  );
}
