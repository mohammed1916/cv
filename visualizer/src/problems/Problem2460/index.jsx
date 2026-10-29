import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2460",
  phases: [
    { id: "setup", label: "Setup", description: "Work on a copy of the array." },
    { id: "pair", label: "Pair", description: "Look at the next pair of neighbors." },
    { id: "check", label: "Compare", description: "Check whether the neighbors are equal." },
    { id: "merge", label: "Merge", description: "Double the left value and zero the right value." },
    { id: "collect", label: "Collect", description: "Keep the non-zero values in order." },
    { id: "pad", label: "Pad", description: "Append zeros to restore the length." },
    { id: "done", label: "Result", description: "Return the transformed array." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON {"nums": [1,2,2,1,1,0]}',
  url: "https://leetcode.com/problems/apply-operations-to-an-array/",
  complexity: "O(n) time and O(n) space for n values. The visualization caps n at 50 values up to 1000.",
  examples: [{ label: "Example 1", input: '{"nums":[1,2,2,1,1,0]}' }],
};

export default function ApplyOperationsVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <IndexedSequence
          label="nums"
          length={step.cur.length}
          active={step.i ?? -1}
          valueAt={index => step.cur[index]}
          roleAt={index => (index === step.i ? "counted" : "")}
        />
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
