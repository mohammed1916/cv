import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import SubtreeColorView from "./SubtreeColorView";
import { code, python, parseInput, buildTrace } from "./algorithm.js";

const phases = [
  { id: "start", label: "Setup", description: "Build the adjacency list from the edges." },
  { id: "enter", label: "Enter", description: "Start the subtree of this node." },
  { id: "descend", label: "Descend", description: "Visit one child first." },
  { id: "merge", label: "Merge", description: "Fold a child's size and colour check into its parent." },
  { id: "leave", label: "Leave", description: "Decide whether this whole subtree is one colour." },
  { id: "done", label: "Result", description: "Report the largest monochrome subtree." },
];

const definition = {
  number: "3004",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with colors (one integer per node) and edges (n - 1 pairs of node numbers)',
  url: "https://leetcode.com/problems/maximum-subtree-of-the-same-color/",
  complexity: "O(n) time and O(n) space for n nodes: one depth-first pass that carries each subtree's size and single-colour flag up to its parent. The visualization caps the tree at 10 nodes.",
  examples: [
    { label: "Root subtree is one colour", input: '{"colors":[3,3,3,3],"edges":[[0,1],[1,2],[1,3]]}' },
    { label: "Inner subtree wins", input: '{"colors":[2,2,2,1,2,2],"edges":[[0,1],[0,2],[1,3],[1,4],[2,5]]}' },
    { label: "Single node tree", input: '{"colors":[5],"edges":[]}' },
  ],
};

export default function Problem3004Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SubtreeColorView run={run} step={step} />}
      renderReasoning={({ step }) => (
        <p>{step.message}</p>
      )}
    />
  );
}
