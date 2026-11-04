import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import Problem1740View from "./Problem1740View";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "1740",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with root (level-order list), p and q, e.g. {"root":[3,5,1,6,2,0,8,null,null,7,4],"p":7,"q":1}',
  url: "https://leetcode.com/problems/find-distance-in-a-binary-tree/",
  complexity: "O(n) time and O(n) space for n nodes. The visualization caps the tree at 15 nodes.",
  examples: [
    { label: "Siblings", input: '{"root":[3,5,1,6,2,0,8,null,null,7,4],"p":7,"q":4}' },
    { label: "Across the root", input: '{"root":[3,5,1,6,2,0,8,null,null,7,4],"p":7,"q":1}' },
    { label: "Same node", input: '{"root":[3,5,1,6,2,0,8,null,null,7,4],"p":6,"q":6}' },
  ],
};

export default function Problem1740() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <Problem1740View run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
