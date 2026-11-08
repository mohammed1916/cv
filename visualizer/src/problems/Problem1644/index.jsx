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
  inputLabel: 'Object with root (level-order list), p and q, e.g. {"root":[3,5,1,6,2,0,8],"p":2,"q":10}',
  url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree-ii/",
  complexity: "O(n) time and O(h) recursion space for n nodes. The visualization caps the tree at 15 nodes.",
  examples: [
    { label: "Both present", input: '{"root":[9,4,12,2,6,10,15],"p":2,"q":10}' },
    { label: "Ancestor of the other", input: '{"root":[9,4,12,2,6,10,15],"p":6,"q":4}' },
    { label: "q absent", input: '{"root":[3,5,1,6,2,0,8],"p":5,"q":99}' },
    { label: 'Same node', input: '{"root":[7],"p":7,"q":7}' },
    { label: 'Root separates the pair', input: '{"root":[9,4,12,2,6,10,15],"p":9,"q":15}' },
    { label: 'Both values absent', input: '{"root":[3,5,1,6,2,0,8],"p":42,"q":43}' },
    { label: 'Long run: 15 nodes', input: '{"root":[41,88,85,97,47,16,64,8,21,46,67,84,91,87,83],"p":8,"q":83}' },
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
