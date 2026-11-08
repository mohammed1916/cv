import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import FairCandidatesView from "./FairCandidatesView";
import { buildTrace, code, parseInput, phases, python } from "./algorithm.js";

const definition = {
  number: "2417",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "Positive integer n (e.g. 2)",
  url: "https://leetcode.com/problems/closest-fair-integer/description/",
  complexity: "O(d * k) time for k candidates tested, each with d digits. The visualization caps n at 1000 and walks upward one candidate at a time.",
  examples: [
    { label: "Example", input: "2" },
    { label: "Already fair", input: "10" },
    { label: "Hundreds", input: "999" },
    { label: 'Smallest n', input: '1' },
    { label: 'Largest n', input: '1000' },
    { label: 'Long run: n = 777', input: '777' },
  ],
};

export default function ClosestFairInteger() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <FairCandidatesView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          A number is fair when its odd and even digit counts match. Starting at n and checking upward finds the smallest fair value at or above n.
          {run ? ` Final answer: ${run.result}.` : ""} {step.message}
        </p>
      )}
    />
  );
}
