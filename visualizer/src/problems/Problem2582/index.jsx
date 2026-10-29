import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2582",
  phases: [
    { id: "setup", label: "Setup", description: "Place the pillow with person 1 and choose the forward direction." },
    { id: "loop", label: "Second", description: "Advance time by one second." },
    { id: "move", label: "Pass", description: "Move the pillow one person in the current direction." },
    { id: "check", label: "Check", description: "See whether the pillow reached an end of the line." },
    { id: "turn", label: "Reverse", description: "Reverse direction at an end." },
    { id: "done", label: "Result", description: "Report who holds the pillow after the given time." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with n and time (e.g. {"n": 4, "time": 5})',
  url: "https://leetcode.com/problems/pass-the-pillow/",
  complexity: "O(time) time and O(1) space for this simulation. The visualization caps n and time at 1000.",
  examples: [
    { label: "n=4, time=5", input: '{"n": 4, "time": 5}' },
    { label: "n=8, time=9", input: '{"n": 8, "time": 9}' },
  ],
};

export default function PassThePillowVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <IndexedSequence
          label="People in line"
          length={step.n}
          indexOffset={1}
          active={step.pos - 1}
          valueAt={(index) => (index + 1 === step.pos ? "pillow" : "")}
          roleAt={(index) => (index + 1 === step.pos ? "holder" : "")}
        />
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
