import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2652",
  phases: [
    { id: "init", label: "Setup", description: "Start the running total at 0." },
    { id: "loop", label: "Visit", description: "Visit the next integer from 1 to n." },
    { id: "check", label: "Divisible?", description: "Test divisibility by 3, 5, or 7." },
    { id: "add", label: "Add", description: "Add the integer to the total." },
    { id: "done", label: "Return", description: "Return the total." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with n (e.g. {"n": 7})',
  url: "https://leetcode.com/problems/sum-multiples/",
  complexity: "O(n) time and O(1) space. The visualization caps n at 1000.",
  examples: [
    { label: "n = 7", input: '{"n": 7}' },
    { label: "n = 10", input: '{"n": 10}' },
    { label: "n = 9", input: '{"n": 9}' },
  ],
};

export default function SumMultiplesVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="Integers 1 to n"
            length={run.input.n}
            valueAt={(i) => i + 1}
            active={step.x ? step.x - 1 : -1}
          />
          <output aria-label="Running total">total = {step.total}</output>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
