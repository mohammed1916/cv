import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import AnswerRangeBar from "../../components/shared/AnswerRangeBar";
import HullLinesView from "./HullLinesView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "3221",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "Array of non-negative integers (e.g. [3,0,8,2,6])",
  url: "https://leetcode.com/problems/maximum-array-hopping-score-ii/",
  complexity: "O(n log n) time and O(n) space: each landing index binary searches the hull of earlier lines, and each line enters and leaves the hull at most once. The visualization caps the array at 10 values from 0 to 100; the official limit is larger.",
  examples: [
    { label: "Spread values", input: "[3,0,8,2,6]" },
    { label: "Two values", input: "[5,9]" },
    { label: "Late peak", input: "[1,1,1,20,1]" },
    { label: 'One value', input: '[0]' },
    { label: 'Equal values', input: '[4,4,4,4]' },
    { label: 'Boundary values', input: '[100,0,50,50,0,100,1,99,2,98]' },
    { label: 'Long run: 10 values', input: '[35,54,66,27,37,1,8,12,5,35]' },
  ],
};

export default function MaximumArrayHoppingScoreII() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <>
        <HullLinesView run={run} step={step} />
        {step.lo >= 0 && step.hi >= step.lo && <AnswerRangeBar title="Hull search range (positions on the hull)" min={0} max={Math.max(1, step.hull.length - 1)} low={step.lo} high={step.hi} />}
      </>}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Final answer: ${run.result}.` : ""}
        </p>
      )}
    />
  );
}
