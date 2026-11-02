import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import Problem1650View from "./Problem1650View";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "1650",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with root (level-order list), p and q, e.g. {"root":[3,5,1,6,2,0,8],"p":5,"q":1}',
  url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree-iii/",
  complexity: "O(h) time and O(1) extra space, where h is the height. The visualization caps the tree at 15 nodes; the official limits are not verified in this draft.",
  examples: [
    { label: "Two branches", input: '{"root":[3,5,1,6,2,0,8,null,null,7,4],"p":5,"q":1}' },
    { label: "Descendant", input: '{"root":[3,5,1,6,2,0,8,null,null,7,4],"p":5,"q":4}' },
    { label: "Deep pair", input: '{"root":[3,5,1,6,2,0,8,null,null,7,4],"p":7,"q":4}' },
  ],
};

export default function Problem1650() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <Problem1650View run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
