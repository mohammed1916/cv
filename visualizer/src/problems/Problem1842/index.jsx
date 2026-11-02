import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import Problem1842View from "./Problem1842View";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "1842",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "A palindromic digit string, e.g. 1221",
  url: "https://leetcode.com/problems/next-palindrome-using-same-digits/",
  complexity: "O(n) time and O(n) space for a digit string of length n. The visualization caps n at 10 digits; the official bounds are not verified in this draft.",
  examples: [
    { label: "Even length", input: "1221" },
    { label: "Odd length", input: "12321" },
    { label: "No larger", input: "11" },
  ],
};

export default function Problem1842() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <Problem1842View run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
