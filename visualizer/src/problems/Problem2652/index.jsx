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
  question: "Given an integer n, return the sum of all numbers from 1 to n that are divisible by 3, 5, or 7.",
  approaches: [
    { name: "Check each number", intuition: "Test each number from 1 to n for divisibility by any of the three values and add it.", time: "O(n)", space: "O(1)" },
    { name: "Inclusion-exclusion", intuition: "Add the multiples of each divisor and subtract overlaps of pairs and the triple.", time: "O(1)", space: "O(1)" },
  ],
  examples: [
    { label: "n = 7", input: '{"n": 7}' },
    { label: "n = 10", input: '{"n": 10}' },
    { label: "n = 9", input: '{"n": 9}' },
    { label: 'Smallest n', input: '{"n":1}' },
    { label: 'Two', input: '{"n":2}' },
    { label: 'Long run: n = 1000', input: '{"n":1000}' },
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
