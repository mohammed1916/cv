import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  phases: [
    { id: "setup", label: "Setup", description: "Prepare the set of values 1 to k." },
    { id: "take", label: "Take", description: "Remove the last element and update the needed set." },
    { id: "check", label: "Check", description: "See whether every value from 1 to k is collected." },
    { id: "done", label: "Result", description: "Report the number of removals." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "nums and k (JSON object with nums and integer k)",
  url: "https://leetcode.com/problems/minimum-operations-to-collect-elements/",
  complexity: "O(n) time and O(k) space. The visualization caps the array at 50 elements.",
  examples: [
    { label: "k = 2", input: '{"nums":[3,1,5,4,2],"k":2}' },
    { label: "k = 5", input: '{"nums":[3,1,5,4,2],"k":5}' },
    { label: "k = 3", input: '{"nums":[3,2,5,3,1],"k":3}' },
  ],
};

export default function MinimumOperationsCollectElements() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="nums (removed from the end)"
            length={run.input.nums.length}
            valueAt={(i) => run.input.nums[i]}
            active={step.cursor}
            roleAt={(i) => (step.cursor >= 0 && i >= step.cursor ? "removed" : "")}
          />
          <p>Still needed: {step.need.length === 0 ? "none" : step.need.join(", ")}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
