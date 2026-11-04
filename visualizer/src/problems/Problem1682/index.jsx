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
  examples: [
    { label: "Nested pairs", input: "rsttsr" },
    { label: "Centre only", input: "xx" },
    { label: "No valid pair", input: "uvw" },
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
