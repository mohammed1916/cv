import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";

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
  examples: [
    { label: "Example 1", input: '{"nums": [5, 1, 2, 2, 8]}' },
    { label: "Example 2", input: '{"nums": [9, 3, 3, 4, 10, 2]}' },
    { label: 'Single value', input: '{"nums": [7]}' },
    { label: 'Equal values', input: '{"nums": [5, 5, 5, 5]}' },
    { label: 'Largest values: 30 items', input: '{"nums":[60,1,60,1,60,1,60,1,60,1,60,1,60,1,60,1,60,1,60,1,60,1,60,1,60,1,60,1,60,1]}' },
    { label: 'Long run: 30 items', input: '{"nums":[15,60,57,58,59,12,25,30,15,56,53,42,31,28,57,6,7,4,45,18,15,60,17,50,3,32,37,14,47,52]}' },
  ],
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
