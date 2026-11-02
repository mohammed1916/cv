import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import Problem1682View from "./Problem1682View";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "1682",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "A lowercase string of 1 to 8 letters, e.g. abba",
  url: "https://leetcode.com/problems/longest-palindromic-subsequence-ii/",
  complexity: "O(n^4) time with memoised windows and a letter state (about O(n^2 * 27) states, each scanning O(n^2) pairs) for a string of length n. The visualization caps s at 8 letters; the official bounds are not verified in this draft.",
  examples: [
    { label: "Nested pairs", input: "abba" },
    { label: "Centre only", input: "aa" },
    { label: "No valid pair", input: "ab" },
  ],
};

export default function Problem1682() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <Problem1682View run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
