import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2656",
  phases: [
    { id: "init", label: "Setup", description: "Find the current maximum and start the score at 0." },
    { id: "loop", label: "Repeat", description: "Start the next of the k operations." },
    { id: "pick", label: "Pick", description: "Add the current maximum to the score." },
    { id: "bump", label: "Replace", description: "Replace the picked value with its successor." },
    { id: "done", label: "Return", description: "Return the maximum score." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with nums and k (e.g. {"nums": [1,2,3,4,5], "k": 3})',
  url: "https://leetcode.com/problems/maximum-sum-with-exactly-k-elements/",
  complexity: "O(n + k) time and O(1) extra space. The visualization caps nums and k at 100.",
  examples: [
    { label: "nums = [1,2,3,4,5], k = 3", input: '{"nums": [1, 2, 3, 4, 5], "k": 3}' },
    { label: "nums = [5,5,5], k = 2", input: '{"nums": [5, 5, 5], "k": 2}' },
  ],
};

export default function MaximumSumExactlyKVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="nums" length={run.input.nums.length} valueAt={(i) => run.input.nums[i]} />
          <output aria-label="Current maximum">best = {step.best}</output>
          <output aria-label="Score">score = {step.score}</output>
          <p>Operation {step.step} of {run.input.k}</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
