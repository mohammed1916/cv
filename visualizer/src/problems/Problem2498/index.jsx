import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2498",
  phases: [
    { id: "setup", label: "Setup", description: "Start with the first single jump." },
    { id: "scan", label: "Scan", description: "Consider a jump that skips one stone." },
    { id: "update", label: "Update", description: "Keep the larger cost." },
    { id: "done", label: "Result", description: "Return the best cost." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON {"stones": [0,2,5,6,7]}',
  url: "https://leetcode.com/problems/frog-jump-ii/",
  complexity: "O(n) time and O(1) space for n stones. The visualization caps the stones at 50 with positions up to 1000000.",
  examples: [
    { label: "Example 1", input: '{"stones":[0,2,5,6,7]}' },
    { label: "Example 2", input: '{"stones":[0,3,9]}' },
  ],
};

export default function FrogJumpIIVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="stones"
            length={run.input.stones.length}
            active={step.i ?? -1}
            valueAt={index => run.input.stones[index]}
            roleAt={index => (index === step.i || index === (step.i ?? -2) + 2 ? "counted" : "")}
          />
          <p>Best cost so far: {step.best}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
