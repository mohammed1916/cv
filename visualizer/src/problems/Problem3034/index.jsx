import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, pythonLineMap, parseInput, buildTrace, sampleInputs } from "./algorithm";

const definition = {
  phases: [
    { id: "init", label: "Setup", description: "Read the pattern length and reset the count." },
    { id: "loop", label: "Window", description: "Pick the next window of m + 1 elements." },
    { id: "compare", label: "Compare", description: "Compare one adjacent pair with the pattern." },
    { id: "check", label: "Check", description: "Accept or reject the current window." },
    { id: "count", label: "Count", description: "Increase the count for a matching window." },
    { id: "done", label: "Result", description: "Return the number of matching subarrays." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'JSON {"nums": [...], "pattern": [...]}',
  url: "https://leetcode.com/problems/number-of-subarrays-that-match-a-pattern-i/",
  complexity: "O(n * m) time and O(1) extra space. The visualization caps n at 100 as stated in the requirements record.",
  examples: sampleInputs.map(({ label, input }) => ({ label, input: JSON.stringify(input) })),
};

export default function NumberOfSubarraysPatternVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <div className="algorithm-visual">
          <IndexedSequence
            label="nums"
            length={run.input.nums.length}
            active={step.start >= 0 ? step.start + (step.k >= 0 ? step.k : 0) : -1}
            valueAt={(i) => run.input.nums[i]}
            roleAt={(i) => (step.start >= 0 && i >= step.start && i <= step.start + run.input.pattern.length ? "window" : "")}
          />
          <p>pattern: [{run.input.pattern.join(", ")}] &nbsp; count: {step.count}</p>
        </div>
      )}
      renderReasoning={({ step }) => <p>{step.explanation}</p>}
    />
  );
}
