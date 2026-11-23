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
  inputLabel: "A lowercase string of 1 to 8 letters, e.g. rsttsr",
  url: "https://leetcode.com/problems/longest-palindromic-subsequence-ii/",
  complexity: "Memoised windows keyed by (l, r, forbidden letter): each state scans its pairs once, so the cost grows with the number of states times the pairs inside each window.",
  question: "Find the longest palindromic subsequence in which adjacent characters differ.",
  approaches: [
    { name: "Memoised interval DP", intuition: "Memoise each window with the forbidden outer letter, pairing matching outer characters as the next layer.", time: "O(n^2 * 26^2) worst case", space: "O(n^2 * 26)" },
  ],
  examples: [
    { label: "Nested pairs", input: "rsttsr" },
    { label: "Centre only", input: "xx" },
    { label: "No valid pair", input: "uvw" },
    { label: 'One letter', input: 'a' },
    { label: 'Equal letters', input: 'aaaa' },
    { label: 'Longest allowed', input: 'abcdefgh' },
    { label: 'Long run: 8 letters', input: 'dadcabbc' },
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
