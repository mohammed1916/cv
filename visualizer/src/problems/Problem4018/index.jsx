import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import TreeGroupsView from "./TreeGroupsView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "4018",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with groups (one label per node) and edges ([u, v] pairs)',
  url: "https://leetcode.com/problems/total-sum-of-interaction-cost-in-tree-groups-ii/",
  complexity: "O(n * g) time for n nodes and g distinct groups, using one count table per node. The visualization caps the tree at 12 nodes; the official bounds are not verified in this draft.",
  examples: [
    { label: "Path of five", input: '{"groups":[1,2,1,2,1],"edges":[[0,1],[1,2],[2,3],[3,4]]}' },
    { label: "Star of one group", input: '{"groups":[3,3,3,3],"edges":[[0,1],[0,2],[0,3]]}' },
    { label: "No repeated group", input: '{"groups":[1,2,3,4],"edges":[[0,1],[1,2],[2,3]]}' },
  ],
};

export default function Problem4018Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <TreeGroupsView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Running total ${step.answer}.` : ""}
        </p>
      )}
    />
  );
}
