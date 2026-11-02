import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import Problem1644View from "./Problem1644View";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "1644",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with root (level-order list), p and q, e.g. {"root":[3,5,1,6,2,0,8],"p":5,"q":1}',
  url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree-ii/",
  complexity: "O(n) time and O(h) recursion space for n nodes. The visualization caps the tree at 15 nodes; the official node limit is not verified in this draft.",
  examples: [
    { label: "Both present", input: '{"root":[3,5,1,6,2,0,8,null,null,7,4],"p":5,"q":1}' },
    { label: "Ancestor of the other", input: '{"root":[3,5,1,6,2,0,8,null,null,7,4],"p":5,"q":4}' },
    { label: "q absent", input: '{"root":[3,5,1,6,2,0,8],"p":5,"q":99}' },
  ],
};

export default function Problem1644() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <Problem1644View run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
