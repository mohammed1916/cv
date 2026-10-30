import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  phases: [
    { id: "start", label: "Setup", description: "Start with zero operations." },
    { id: "scan", label: "Scan", description: "Visit each value in nums." },
    { id: "check", label: "Check", description: "Compare the value with k." },
    { id: "count", label: "Count", description: "A value below k must be removed once." },
    { id: "done", label: "Result", description: "Return the number of removals." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "JSON object with nums and k",
  url: "https://leetcode.com/problems/minimum-operations-to-exceed-threshold-value-i/",
  complexity: "O(n) time and O(1) extra space. The visualization caps nums at 50 values.",
  examples: [
    { label: "Search snippet example (not verified against the full statement)", input: '{"nums":[2,11,10,1,3],"k":10}' },
    { label: "illustrative (not from the statement)", input: '{"nums":[5,6,7],"k":6}' },
  ],
};

export default function MinimumOperationsThresholdI() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label={`nums (k = ${run.input.k})`}
            length={run.input.nums.length}
            valueAt={(i) => run.input.nums[i]}
            active={step.index}
            roleAt={(i) => (step.counted.includes(i) ? "read" : "")}
          />
          <p>Removals counted: {step.operations}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
