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
    { label: "Example 1", input: '{"nums":[4,12,8,1,9],"k":8}' },
    { label: "Example 2", input: '{"nums":[5,6,7,2],"k":6}' },
    { label: 'Single value', input: '{"nums":[5],"k":5}' },
    { label: 'Equal values', input: '{"nums":[3,3,3],"k":3}' },
    { label: 'Zero and negatives', input: '{"nums":[-4,0,9],"k":0}' },
    { label: 'Long run: 50 values', input: '{"nums":[-15,-9,-18,14,-16,14,-9,8,4,-8,-8,1,13,11,4,-15,4,-8,16,9,13,-13,15,-15,-14,14,6,20,-7,-10,-14,18,19,1,-12,13,-19,-7,-20,12,17,-10,-10,-9,-19,6,-6,6,-15,6],"k":7}' },
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
