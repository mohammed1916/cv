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
  inputLabel: 'JSON object with nums and k (e.g. {"nums": [4,9,2,9,6], "k": 4})',
  url: "https://leetcode.com/problems/maximum-sum-with-exactly-k-elements/",
  complexity: "O(n + k) time and O(1) extra space. The visualization caps nums and k at 100.",
  examples: [
    { label: "nums = [4,9,2,9,6], k = 4 (repeated maximum)", input: '{"nums": [4, 9, 2, 9, 6], "k": 4}' },
    { label: "nums = [20,20,20,20,4], k = 6 (tied block)", input: '{"nums": [20, 20, 20, 20, 4], "k": 6}' },
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
