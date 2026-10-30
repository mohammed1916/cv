import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  phases: [
    { id: "sort", label: "Sort", description: "Sort the values." },
    { id: "median", label: "Median", description: "Pick the middle value or values." },
    { id: "down", label: "Below", description: "Find the nearest palindrome at or below a median." },
    { id: "up", label: "Above", description: "Find the nearest palindrome at or above a median." },
    { id: "candidates", label: "Candidates", description: "Collect the distinct candidate palindromes." },
    { id: "cost", label: "Cost", description: "Compare the total cost of each candidate." },
    { id: "done", label: "Result", description: "Return the smallest cost." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object: {"nums": [1, 2, 3, 4, 5]}',
  url: "https://leetcode.com/problems/minimum-cost-to-make-array-equalindromic/",
  complexity: "O(n log n) for sorting plus the palindrome search and O(n) per candidate. The visualization caps values at 1000 and n at 50.",
  examples: [
    { label: "Example 1 (from a search snippet, not verified against the statement)", input: '{"nums": [1, 2, 3, 4, 5]}' },
    { label: "Illustrative example (not from the statement)", input: '{"nums": [10, 12, 13, 14, 15]}' },
  ],
};

export default function MinimumCostEqualindromicVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence
            label="nums"
            length={run.input.nums.length}
            valueAt={(i) => run.input.nums[i]}
            active={-1}
            roleAt={(i) => (step.target !== null && run.input.nums[i] === step.target ? "target" : "")}
          />
          <p>
            Target {step.target ?? "not chosen"} · candidates [{step.candidates.join(", ")}]
            {step.best !== null ? ` · best cost ${step.best}` : ""}
          </p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
