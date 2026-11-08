import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import DisjointSubtreePairsView from "./DisjointSubtreePairsView";
import { buildTrace, code, parseInput, phases, python } from "./algorithm.js";

const definition = {
  number: "2479",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with values (node values) and edges (tree edges, rooted at node 0)',
  url: "https://leetcode.com/problems/maximum-xor-of-two-non-overlapping-subtrees/description/",
  complexity: "O(n^2) pair checks with O(n) ancestor walks for n nodes, O(n) space. The visualization caps the tree at 10 nodes and values at 1 to 50.",
  examples: [
    { label: "Star", input: '{"values":[1,2,3,4],"edges":[[0,1],[0,2],[0,3]]}' },
    { label: "Path", input: '{"values":[1,2,3],"edges":[[0,1],[1,2]]}' },
    { label: 'Single node', input: '{"values":[7],"edges":[]}' },
    { label: 'Equal values', input: '{"values":[3,3,3],"edges":[[0,1],[1,2]]}' },
    { label: 'Extreme values', input: '{"values":[50,1,50,1,50,1,50,1,50,1],"edges":[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9]]}' },
    { label: 'Long run: 10 nodes', input: '{"values":[18,30,46,3,16,41,22,22,21,6],"edges":[[0,1],[1,2],[2,3],[3,4],[1,5],[2,6],[2,7],[0,8],[2,9]]}' },
  ],
};

export default function MaxXorNonOverlappingSubtrees() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <DisjointSubtreePairsView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          Each node's subtree sum is computed from its leaves upward. Two nodes can both be chosen only when neither is an ancestor of the other. The table tests every pair and keeps the largest XOR of disjoint sums.
          {run ? ` Final answer: ${run.result}.` : ""} {step.message}
        </p>
      )}
    />
  );
}
