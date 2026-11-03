import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import TreeLevelView from "./TreeLevelView";
import { code, python, parseInput, buildTrace } from "./algorithm.js";

const phases = [
  { id: "start", label: "Root", description: "Put the root in the queue." },
  { id: "level", label: "Level", description: "Count the nodes waiting for this level." },
  { id: "visit", label: "Visit", description: "Add a node's value and queue its children." },
  { id: "best", label: "New best", description: "This level has the smallest sum so far." },
  { id: "keep", label: "Keep", description: "An earlier level still has the smaller sum." },
  { id: "done", label: "Result", description: "Report the level with the minimum sum." },
];

const definition = {
  number: "3157",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "Level-order list with null for missing children (e.g. [4,1,9,-6,2,null,3])",
  url: "https://leetcode.com/problems/find-the-level-of-tree-with-minimum-sum/",
  complexity: "O(n) time and O(w) extra space for n nodes and maximum width w. The visualization accepts up to 31 entries and values from -100000 to 100000; the official limits are not verified here.",
  examples: [
    { label: "Dip at depth three", input: "[4,1,9,-6,2,null,3]" },
    { label: "Tie at the top", input: "[0,1,-1]" },
    { label: "Single node", input: "[7]" },
  ],
};

export default function LevelWithMinimumSumVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <TreeLevelView run={run} step={step} />}
      renderReasoning={({ run }) => (
        <p>
          Level sums are compared one level at a time with a strict less-than test, so a tie keeps the earlier level. The answer for this tree is level {run.result}.
        </p>
      )}
    />
  );
}
