import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { code, python, parseInput, buildTrace } from "./algorithm.js";
import MirrorSlotsView from "./MirrorSlotsView";

const definition = {
  number: "3088",
  phases: [
    { id: "start", label: "Setup", description: "Check parity and count letters." },
    { id: "check", label: "Check", description: "Try a letter for this position." },
    { id: "keep", label: "Keep", description: "The rest can still be completed." },
    { id: "reject", label: "Reject", description: "This letter leads to a dead end." },
    { id: "skip", label: "Skip", description: "The mirror already holds this letter." },
    { id: "place", label: "Place", description: "Commit the letter." },
    { id: "done", label: "Result", description: "Return the arrangement or -1." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "Lowercase letters",
  url: "https://leetcode.com/problems/make-string-anti-palindrome/",
  complexity: "O(n^3 * 26) time in the worst case with memoised feasibility, and O(n^2) extra space for n letters. Odd lengths and impossible strings return the sentinel '-1'. The visualization caps the string at 12 lowercase letters.",
  examples: [
    { label: "Pairs can differ", input: "aabb" },
    { label: "Smallest arrangement", input: "bcaa" },
    { label: "Impossible", input: "zzzz" },
    { label: "Single letter", input: "a" },
    { label: "Two equal pairs", input: "abab" },
    { label: "Longest allowed: 12 letters", input: "dcbadcbadcba" },
    { label: "Long run: 12 letters", input: "hcbedgfahcbe" },
  ],
};

export default function Problem3088Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <MirrorSlotsView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
