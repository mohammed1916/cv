import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  phases: [
    { id: "setup", label: "Setup", description: "Start with no groups." },
    { id: "scan", label: "Visit", description: "Visit the next 1-indexed position." },
    { id: "reduce", label: "Reduce", description: "Divide out square factors to get the group key." },
    { id: "group", label: "Group", description: "Add the value to its group sum." },
    { id: "done", label: "Result", description: "Report the largest group sum." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "nums (JSON object with nums, 1 to 30 positive integers)",
  url: "https://leetcode.com/problems/maximum-element-sum-of-a-complete-subset-of-indices/",
  complexity: "O(n * sqrt(n)) time and O(n) space for n values. The visualization caps the array at 30 elements.",
  examples: [
    { label: "Example", input: '{"nums":[8,7,3,5,7,2,4,9]}' },
  ],
};

export default function MaximumElementSumCompleteSubset() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <IndexedSequence
          label="nums (1-indexed positions)"
          length={run.input.nums.length}
          valueAt={(i) => run.input.nums[i]}
          active={step.index > 0 ? step.index - 1 : -1}
          roleAt={(i) => (step.index > 0 && step.key !== null && i === step.index - 1 ? "group" : "")}
        />
      )}
      renderReasoning={({ step }) => (
        <>
          <p>{step.message}</p>
          <p>Groups so far: {step.groups.length === 0 ? "none" : step.groups.map((g) => `key ${g.key} sum ${g.sum}`).join(", ")}.</p>
        </>
      )}
    />
  );
}
