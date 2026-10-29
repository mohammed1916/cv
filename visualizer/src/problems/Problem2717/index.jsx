import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2717",
  phases: [
    { id: "setup", label: "Length", description: "Read n, the permutation length." },
    { id: "find", label: "Locate", description: "Find the positions of 1 and n." },
    { id: "front", label: "1 to front", description: "Count the swaps that move 1 to index 0." },
    { id: "back", label: "n to end", description: "Count the swaps that move n to the last index." },
    { id: "check", label: "Overlap?", description: "Check whether 1 sits after n." },
    { id: "adjust", label: "Correct", description: "Remove the swap counted twice." },
    { id: "done", label: "Return", description: "Return the total number of swaps." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'nums JSON object (e.g. {"nums": [2,1,4,3]})',
  url: "https://leetcode.com/problems/semi-ordered-permutation/",
  complexity: "O(n) time and O(1) extra space for permutation length n between 2 and 50.",
  examples: [
    { label: "Example 1", input: '{"nums": [2,1,4,3]}' },
    { label: "Example 2", input: '{"nums": [2,4,1,3]}' },
    { label: "Example 3", input: '{"nums": [1,3,4,2,5]}' },
  ],
};

export default function SemiOrderedPermutationVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="nums (permutation)"
            length={step.nums.length}
            valueAt={(index) => step.nums[index]}
            active={step.one}
            roleAt={(index) => (index === step.one ? "value 1" : index === step.last ? `value ${step.n}` : "")}
          />
          <dl>
            <dt>Index of 1</dt>
            <dd>{step.one >= 0 ? step.one : "not located"}</dd>
            <dt>Index of {step.n}</dt>
            <dd>{step.last >= 0 ? step.last : "not located"}</dd>
            <dt>Swaps so far</dt>
            <dd>{step.swaps}</dd>
          </dl>
          {step.phase === "done" && <output aria-label="Semi-ordered permutation result">Minimum swaps: {run.result}</output>}
        </>
      )}
      renderReasoning={({ step }) => (
        <>
          <p>Moving 1 to the front costs one swap per position it must pass. Moving n to the end costs one swap per position between it and the last index.</p>
          <p>If 1 starts after n, moving 1 left also shifts n one step right, so one swap is counted in both moves and is subtracted once.</p>
          <p>{step.message}</p>
        </>
      )}
    />
  );
}
