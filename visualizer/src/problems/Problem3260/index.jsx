import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import RecurrenceGrid from "../../components/shared/RecurrenceGrid";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "3260",
  phases: [
    { id: "weights", label: "Weights", description: "Compute each mirrored pair's remainder weight." },
    { id: "reach", label: "Reach", description: "Build the remainders reachable from each suffix." },
    { id: "try", label: "Try digits", description: "Try digits from largest to smallest." },
    { id: "keep", label: "Keep", description: "Keep the first digit that can still finish." },
    { id: "mirror", label: "Mirror", description: "Mirror the half into the palindrome." },
    { id: "none", label: "No answer", description: "No digit fits this position." },
    { id: "done", label: "Result", description: "Return the palindrome." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Length n and divisor k (JSON, e.g. {"n": 3, "k": 5})',
  url: "https://leetcode.com/problems/find-the-largest-palindrome-divisible-by-k/",
  complexity: "O(n) time for the reach sets and greedy pass (about 10 * k work per position) and O(n) space. The visualization accepts n up to 40.",
  examples: [
    { label: "n 3, k 5 (from statement)", input: '{"n": 3, "k": 5}' },
    { label: "n 5, k 6 (from statement)", input: '{"n": 5, "k": 6}' },
  ],
};

export default function LargestPalindromeVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => {
        const rows = Math.max(1, step.half)
        const rowLabels = Array.from({ length: rows }, (_, i) => `pos ${i}`)
        const columnLabels = Array.from({ length: step.k }, (_, c) => `rem ${c}`)
        return (
          <div>
            <RecurrenceGrid label={`Reachable remainders for positions ${step.pos >= 0 ? `from ${step.pos}` : ""}`}
              rowLabels={rowLabels} columnLabels={columnLabels}
              row={Math.max(0, step.pos)} column={step.need ?? 0}
              valueAt={(r, c) => (step.reachRows[r + 1]?.[c] ? "yes" : "no")}
              roleAt={(r, c) => (r === step.pos && c === step.need ? "current" : "")} />
            <p>Digits so far: {step.digits.join("") || "none"}</p>
          </div>
        )
      }}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
