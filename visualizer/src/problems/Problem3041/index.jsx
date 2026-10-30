import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, pythonLineMap, parseInput, buildTrace, sampleInputs } from "./algorithm";

const definition = {
  phases: [
    { id: "init", label: "Setup", description: "Start with no runs recorded." },
    { id: "loop", label: "Scan", description: "Take the next value from the sorted array." },
    { id: "candidate", label: "Candidate", description: "Consider the value as-is or raised by 1." },
    { id: "update", label: "Record", description: "Record the longest run ending at each value." },
    { id: "done", label: "Result", description: "Return the longest run found." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'JSON {"nums": [...]}',
  url: "https://leetcode.com/problems/maximize-consecutive-elements-in-an-array-after-modification/",
  complexity: "O(n log n) time for the sort and O(n) extra space. The visualization caps nums at 30 values up to 60.",
  examples: sampleInputs.map(({ label, input }) => ({ label, input: JSON.stringify(input) })),
};

export default function MaximizeConsecutiveVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <div className="algorithm-visual">
          <IndexedSequence
            label="sorted nums"
            length={run.input.nums.length}
            active={step.index}
            valueAt={(i) => step.sorted[i]}
          />
          <p>best: {JSON.stringify(step.best)} &nbsp; ans: {step.ans}</p>
        </div>
      )}
      renderReasoning={({ step }) => <p>{step.explanation}</p>}
    />
  );
}
