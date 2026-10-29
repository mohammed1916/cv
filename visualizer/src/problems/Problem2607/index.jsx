import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2607",
  phases: [
    { id: "setup", label: "Setup", description: "Compute n and g = gcd(n, k), the number of cycles." },
    { id: "loop", label: "Cycle", description: "Choose the next cycle start." },
    { id: "gather", label: "Gather", description: "Collect and sort the values of this cycle." },
    { id: "median", label: "Median", description: "Choose the median as the target value." },
    { id: "add", label: "Cost", description: "Add the cost of moving the cycle to its target." },
    { id: "done", label: "Result", description: "Report the total number of operations." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with arr and k (e.g. {"arr": [1, 4, 1, 3], "k": 2})',
  url: "https://leetcode.com/problems/make-k-subarray-sums-equal/",
  complexity: "O(n log n) time and O(n) space for n = arr.length. The visualization caps arr at 200 values.",
  examples: [
    { label: "[1,4,1,3], k=2", input: '{"arr": [1, 4, 1, 3], "k": 2}' },
    { label: "[2,5,5,7], k=3", input: '{"arr": [2, 5, 5, 7], "k": 3}' },
  ],
};

export default function MakeKSubarraySumsEqualVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <IndexedSequence
          label="Circular array"
          length={step.arr.length}
          active={step.start === null ? -1 : step.cycleIndices[0] ?? -1}
          valueAt={(index) => step.arr[index]}
          roleAt={(index) => (step.cycleIndices.includes(index) ? `cycle ${step.start}` : "")}
        />
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
