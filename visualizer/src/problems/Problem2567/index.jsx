import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2567",
  phases: [
    { id: "setup", label: "Setup", description: "Read the original values." },
    { id: "sort", label: "Sort", description: "Sort the values so the candidate ranges are visible." },
    { id: "candidate", label: "Candidates", description: "Evaluate each way of changing the two outer values." },
    { id: "pick", label: "Pick", description: "Choose the smallest candidate." },
    { id: "done", label: "Result", description: "Report the minimum score." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with nums (e.g. {"nums": [1, 4, 7, 8, 5]})',
  url: "https://leetcode.com/problems/minimum-score-by-changing-two-elements/",
  complexity: "O(n log n) time and O(n) space for n = nums.length. The visualization caps nums at 40 values.",
  examples: [{ label: "[1,4,7,8,5]", input: '{"nums": [1, 4, 7, 8, 5]}' }],
};

export default function MinimumScoreVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => (
        <IndexedSequence
          label="Sorted values"
          length={step.values.length}
          active={step.pair.length ? step.pair[1] : -1}
          valueAt={(index) => step.values[index]}
          roleAt={(index) => (step.pair.includes(index) ? `${step.candidate} pair` : "")}
        />
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
