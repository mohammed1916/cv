import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import TreeMatchView from "./TreeMatchView";
import { buildTrace, code, parseInput, phases, python } from "./algorithm.js";

const definition = {
  number: "2378",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "Object with parents (parents[0] = -1) and weights (weights[v] is the edge from parents[v] to v)",
  url: "https://leetcode.com/problems/choose-edges-to-maximize-score-in-a-tree/description/",
  complexity: "O(n) time and space for n nodes. The visualization caps the tree at 10 nodes and weights at -100 to 100.",
  examples: [
    { label: "Example", input: '{"parents":[-1,0,0,1,1,2],"weights":[0,4,-3,6,2,5]}' },
    { label: "Skip negative", input: '{"parents":[-1,0,0],"weights":[0,-4,-7]}' },
  ],
};

export default function ChooseEdgesMaximizeScore() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <TreeMatchView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          Each node records two totals: free (its edge to a child is not used) and matched (it is paired with one child). A pair blocks both endpoints, so a child that is matched to its parent must use its free total.
          {run ? ` Final answer: ${run.result}.` : ""} {step.message}
        </p>
      )}
    />
  );
}
