import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import AdjacentOrView from "./AdjacentOrView";
import { code, python, parseInput, buildTrace } from "./algorithm.js";

const phases = [
  { id: "start", label: "Read", description: "Read the values and size the answer." },
  { id: "pair", label: "Pair", description: "Take the next pair of neighbours." },
  { id: "or", label: "OR", description: "Write the bitwise OR of the pair." },
  { id: "done", label: "Result", description: "Report every adjacent OR." },
];

const definition = {
  number: "3173",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "List of integers (e.g. [1,2,3,4])",
  url: "https://leetcode.com/problems/bitwise-or-of-adjacent-elements/",
  complexity: "O(n) time and O(n) output space for n values, since each neighbour pair is OR-ed once. The visualization accepts up to 12 values from 0 to 1023; the official bounds are not verified here.",
  examples: [
    { label: "Four values", input: "[1,2,3,4]" },
    { label: "Zero in the middle", input: "[8,0,5]" },
    { label: "Single value", input: "[6]" },
  ],
};

export default function BitwiseOrAdjacentVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <AdjacentOrView run={run} step={step} />}
      renderReasoning={({ run }) => (
        <p>
          Each answer entry only looks at one neighbouring pair, so every position is computed once. For this input the answer is [{run.result.join(", ")}].
        </p>
      )}
    />
  );
}
