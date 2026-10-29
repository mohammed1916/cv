import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2357",
  phases: [
    { id: "setup", label: "Setup", description: "Start with an empty set of nonzero values." },
    { id: "scan", label: "Scan", description: "Visit each value in order." },
    { id: "check", label: "Check", description: "Decide whether the value is nonzero." },
    { id: "record", label: "Record", description: "Add the nonzero value to the set." },
    { id: "done", label: "Result", description: "Report the number of distinct nonzero values." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'JSON {"nums": [1,5,0,3,5]}',
  url: "https://leetcode.com/problems/make-array-zero-by-subtracting-equal-amounts/",
  complexity: "O(n) time and O(n) space for n values in nums. The visualization caps n at 50.",
  examples: [{ label: "Example 1", input: '{"nums":[1,5,0,3,5]}' }],
};

export default function MakeArrayZeroVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="nums"
            length={run.input.length}
            active={step.i ?? -1}
            valueAt={index => run.input[index]}
            roleAt={index => (index <= (step.i ?? -1) ? (run.input[index] > 0 ? "counted" : "zero") : "")}
          />
          <p>Set of distinct nonzero values: {step.seen.join(", ") || "empty"}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
