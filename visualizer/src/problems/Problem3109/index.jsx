import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { code, python, parseInput, buildTrace } from "./algorithm.js";
import RankAccumulatorView from "./RankAccumulatorView";

const definition = {
  number: "3109",
  phases: [
    { id: "start", label: "Setup", description: "Start with rank zero." },
    { id: "count", label: "Count", description: "Count unused smaller values." },
    { id: "add", label: "Add", description: "Add the weighted count to the rank." },
    { id: "done", label: "Result", description: "Return the rank modulo 1000000007." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "JSON array holding a permutation of 1 to n",
  url: "https://leetcode.com/problems/find-the-index-of-permutation/",
  complexity: "O(n^2) time and O(n) extra space for a permutation of n values, as the visualization counts unused values directly. The visualization caps the permutation at 8 values; the modulus 1000000007 is applied at every step.",
  examples: [
    { label: "Middle of three", input: "[2, 1, 3]" },
    { label: "Five values", input: "[4, 2, 5, 1, 3]" },
    { label: "Identity", input: "[1, 2, 3, 4]" },
    { label: "Single value", input: "[1]" },
    { label: "Sorted permutation", input: "[1,2,3,4,5,6,7,8]" },
    { label: "Reversed permutation", input: "[8,7,6,5,4,3,2,1]" },
    { label: "Long run: 8 values", input: "[5,3,8,1,7,2,6,4]" },
  ],
};

export default function Problem3109Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <RankAccumulatorView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
