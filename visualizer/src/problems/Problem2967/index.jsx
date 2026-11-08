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
    { label: "Example 1", input: '{"nums": [1, 2, 3, 4, 5]}' },
    { label: "Example 2", input: '{"nums": [10, 12, 13, 14, 15]}' },
    { label: 'Palindrome already', input: '{"nums":[1]}' },
    { label: 'Equal values', input: '{"nums":[7,7]}' },
    { label: 'Largest value', input: '{"nums":[1000]}' },
    { label: 'Long run: 50 values', input: '{"nums":[9,980,116,908,165,276,250,775,853,602,340,931,90,393,295,661,769,782,422,505,706,655,87,133,844,384,931,893,723,282,852,671,510,33,173,957,190,613,744,252,734,475,892,217,331,3,445,191,6,506]}' },
  ],
};

export default function MinimumCostEqualindromicVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          {(() => {
            const sorted = step.sorted ?? [...run.input.nums].sort((a, b) => a - b)
            const n = sorted.length
            const middles = n % 2 ? [(n - 1) / 2] : [n / 2 - 1, n / 2]
            return (
              <IndexedSequence
                label="nums in sorted order (middle marked)"
                length={n}
                valueAt={(i) => sorted[i]}
                active={-1}
                roleAt={(i) => (middles.includes(i) ? "median" : step.target !== null && sorted[i] === step.target ? "target" : "")}
              />
            )
          })()}
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
