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
  complexity: "O(n) time and O(n) space for a digit string of length n. The visualization shows at most 10 digits so each swap and reversal stays visible.",
  examples: [
    { label: "Even length", input: "1221" },
    { label: "Odd length", input: "12321" },
    { label: "No larger", input: "11" },
  { label: 'Single digit', input: "7" },
  { label: 'All zeros', input: "0000" },
  { label: 'Ten digits, largest', input: "9999999999" },
  { label: 'Long run: 10 digits', input: "6806336086" },
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
