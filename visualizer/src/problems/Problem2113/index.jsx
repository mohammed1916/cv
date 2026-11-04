import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import ElementsAfterRemovalView from "./ElementsAfterRemovalView";
import { buildTrace, parseInput, code, python } from "./algorithm.js";

const definition = {
  phases: [
    { id: "start", label: "Start", description: "The array is nums at time 0." },
    { id: "remove", label: "Remove", description: "The leftmost element leaves the array each second." },
    { id: "empty", label: "Empty", description: "Every element has left the array." },
    { id: "restore", label: "Restore", description: "Removed elements return in their original order." },
    { id: "query", label: "Query", description: "Reduce the time to its place in the cycle and read the index." },
    { id: "done", label: "Answers", description: "Every query has an answer." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums and queries (e.g. {"nums":[7,3,9],"queries":[[1,0]]})',
  url: "https://leetcode.com/problems/elements-in-array-after-removing-and-replacing-elements/",
  complexity: "O(n + q) time and O(n) space for n elements and q queries, using the cycle length 2n. Restored elements are appended in their removal order, so the array after k restores is nums[0..k-1]. Time 0 is nums. The visualization caps nums at 10 values and queries at 8.",
  examples: [
    { label: "Cycle walk", input: '{"nums":[4,8,15,16,23,42],"queries":[[0,2],[5,0],[7,4],[12,1],[20,5]]}' },
    { label: "Short cycle", input: '{"nums":[7,3,9],"queries":[[1,0],[2,1],[4,2],[6,0]]}' },
  ],
};

export default function ElementsInArrayAfterRemovingAndReplacing() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ElementsAfterRemovalView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run && step.phase === "done" ? `Answers: ${run.result.join(", ")}.` : ""}
        </p>
      )}
    />
  );
}
