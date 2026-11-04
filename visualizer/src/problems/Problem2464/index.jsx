import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import PrefixPieceView from "./PrefixPieceView";
import { buildTrace, code, parseInput, phases, python } from "./algorithm.js";

const definition = {
  number: "2464",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "Array of integers (e.g. [3,5,6])",
  url: "https://leetcode.com/problems/minimum-subarrays-in-a-valid-split/description/",
  complexity: "O(n^2) gcd checks for n values, with O(n) space for the prefix table. The visualization caps the array at 12 values of 1 to 30.",
  examples: [
    { label: "Example", input: "[3,5,6]" },
    { label: "Singletons", input: "[2,3,5]" },
    { label: "Impossible", input: "[1,2]" },
    { label: "Split", input: "[2,6,3,4,3]" },
  ],
};

export default function MinimumSubarraysValidSplit() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <PrefixPieceView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          The table dp[k] holds the fewest valid pieces that cover the first k values. A piece is valid only when its two end values share a factor above one, so each new prefix tries every start point for its last piece.
          {run ? ` Final answer: ${run.result}.` : ""} {step.message}
        </p>
      )}
    />
  );
}
