import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2455",
  phases: [
    { id: "setup", label: "Setup", description: "Start with a sum and a count of 0." },
    { id: "scan", label: "Scan", description: "Visit each value in order." },
    { id: "check", label: "Check", description: "Check whether the value is divisible by 6." },
    { id: "record", label: "Record", description: "Add the value to the sum and the count." },
    { id: "done", label: "Result", description: "Return the rounded-down average, or 0." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON {"nums": [1,3,6,10,12,15]}',
  url: "https://leetcode.com/problems/average-value-of-even-numbers-that-are-divisible-by-three/",
  complexity: "O(n) time and O(1) space for n values. The visualization caps n at 50 values up to 1000.",
  examples: [
    { label: "Example 1", input: '{"nums":[1,3,6,10,12,15]}' },
    { label: "Example 2", input: '{"nums":[1,2,4,7,10]}' },
  ],
};

export default function AverageEvenDivisibleByThreeVisualizer() {
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
            roleAt={index => (index <= (step.i ?? -1) && run.input[index] % 6 === 0 ? "counted" : "")}
          />
          <p>Sum of qualifying values: {step.total}. Count: {step.count}.</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
