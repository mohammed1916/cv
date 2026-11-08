import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import BitDoublingView from "./BitDoublingView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "4073",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with n (integer from 1 to 10^15)',
  url: "https://leetcode.com/problems/count-good-strings/",
  complexity: "O(log n) multiplications of 2 by 2 matrices (fast doubling), each on numbers below the modulus. A good string is one whose maximal runs all have odd length, which gives the count 2 times F(n). The official bounds are as stated in the draft and are not independently verified.",
  examples: [
    { label: "One letter", input: '{"n":1}' },
    { label: "Three letters", input: '{"n":3}' },
    { label: "Ten letters", input: '{"n":10}' },
    { label: "Power of two: 8", input: '{"n":8}' },
    { label: "All ones in binary: 15", input: '{"n":15}' },
    { label: "Largest allowed n", input: '{"n":1000000000000000}' },
    { label: "Long run: 15-digit n", input: '{"n":660694263908097}' },
  ],
};

export default function Problem4073Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <BitDoublingView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message} Good strings are exactly those whose runs all have odd length, so counting them is counting ways to split n into odd parts, which Fibonacci numbers do.</p>}
    />
  );
}
