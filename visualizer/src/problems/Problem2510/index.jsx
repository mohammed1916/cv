import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import BalanceGridView from "./BalanceGridView";
import { buildTrace, code, parseInput, phases, python } from "./algorithm.js";

const definition = {
  number: "2510",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "Binary grid (e.g. [[0,1,0,0],[0,1,0,0],[1,0,1,0]])",
  url: "https://leetcode.com/problems/check-if-there-is-a-path-with-equal-number-of-0s-and-1s/description/",
  complexity: "O(m * n * B) time for B possible balances, O(m * n * B) space. The visualization caps the grid at 6 x 6; the official bounds are not verified in this draft.",
  examples: [
    { label: "Example", input: "[[0,1,0,0],[0,1,0,0],[1,0,1,0]]" },
    { label: "No balance", input: "[[0,0,0],[0,0,0]]" },
    { label: "Single cell", input: "[[0]]" },
  ],
};

export default function EqualZerosOnesPath() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <BalanceGridView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          Each cell stores every balance (zeros minus ones) that some right-and-down path can reach it with. Adding the cell's own value shifts each balance by one. The answer is yes when balance zero reaches the bottom-right corner.
          {run ? ` Final answer: ${run.result ? "yes" : "no"}.` : ""} {step.message}
        </p>
      )}
    />
  );
}
