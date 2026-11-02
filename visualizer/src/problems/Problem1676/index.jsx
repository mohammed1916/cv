import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import Problem1676View from "./Problem1676View";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "1676",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with root (level-order list) and nodes, e.g. {"root":[3,5,1,6,2,0,8,null,null,7,4],"nodes":[4,7]}',
  url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree-iv/",
  complexity: "O(n) time and O(h) recursion space for n nodes. The visualization caps the tree at 15 nodes and the target list at 6; the official limits are not verified in this draft.",
  examples: [
    { label: "Two targets", input: '{"root":[3,5,1,6,2,0,8,null,null,7,4],"nodes":[4,7]}' },
    { label: "Three targets", input: '{"root":[3,5,1,6,2,0,8,null,null,7,4],"nodes":[6,0,8]}' },
    { label: "One target", input: '{"root":[3,5,1,6,2,0,8,null,null,7,4],"nodes":[1]}' },
  ],
};

export default function Problem1676() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <Problem1676View run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
