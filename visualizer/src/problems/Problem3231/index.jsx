import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import PileDealView from "./PileDealView";
import AnswerRangeBar from "../../components/shared/AnswerRangeBar";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "3231",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "Array of integers from 0 to 99 (e.g. [4,2,5,1,3])",
  url: "https://leetcode.com/problems/minimum-number-of-increasing-subsequence-to-be-removed/",
  complexity: "O(n log n) time with a binary search per value, and O(n) space for the tops. The list form here inserts at the front, so its worst case is O(n^2); storing the tops in reverse order gives O(n log n). The visualization caps the array at 12 values.",
  examples: [
    { label: "Zig-zag", input: "[4,2,5,1,3]" },
    { label: "Falling run", input: "[9,7,5,3]" },
    { label: "Already rising", input: "[1,2,3,4]" },
    { label: 'One value', input: '[0]' },
    { label: 'Equal values tie', input: '[7,7,7,7]' },
    { label: 'Boundary values 0 and 99', input: '[99,0,99,0,99,0,99,0,99,0,99,0]' },
    { label: 'Long run: 12 values', input: '[12,26,77,96,78,54,1,41,59,9,63,18]' },
  ],
};

export default function MinimumIncreasingSubsequenceRemoval() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <>
        <PileDealView run={run} step={step} />
        {typeof step.lo === "number" && step.hi >= step.lo && <AnswerRangeBar title="Pile search range (tops below x)" min={0} max={Math.max(1, step.piles.length)} low={step.lo} high={step.hi} />}
      </>}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Final answer: ${run.result}.` : ""}
        </p>
      )}
    />
  );
}
