import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import RotationCostView from "./RotationCostView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "4028",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with s (lowercase letters)',
  url: "https://leetcode.com/problems/minimum-operations-to-make-a-rotated-palindrome-ii/",
  complexity: "O(n^2) time and O(n) extra space: each of the n rotations is priced over n/2 mirror pairs. Letter steps on one position never need to be split, because the cost of matching a pair is the smaller of the two forward distances around the alphabet.",
  examples: [
    { label: "Three letters", input: '{"s":"abc"}' },
    { label: "Two letters", input: '{"s":"ab"}' },
    { label: "Wrap around", input: '{"s":"xyz"}' },
  ],
};

export default function Problem4028Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <RotationCostView run={run} step={step} />}
      renderReasoning={({ step }) => (
        <p>
          {step.message} Each mirror pair is matched by advancing the letters either forward from the left one or forward from the right one, whichever is shorter.
        </p>
      )}
    />
  );
}
