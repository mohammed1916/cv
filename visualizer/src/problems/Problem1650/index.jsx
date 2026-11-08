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
  inputLabel: 'Object with root (level-order list), p and q, e.g. {"root":[3,5,1,6,2,0,8],"p":2,"q":10}',
  url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree-iii/",
  complexity: "O(h) time and O(1) extra space, where h is the height. The visualization caps the tree at 15 nodes.",
  examples: [
    { label: "Two branches", input: '{"root":[9,4,12,2,6,10,15],"p":2,"q":10}' },
    { label: "Descendant", input: '{"root":[9,4,12,2,6,10,15],"p":6,"q":4}' },
    { label: "Deep pair", input: '{"root":[9,4,12,2,6,10,15],"p":15,"q":12}' },
    { label: 'Same node twice', input: '{"root":[9,4,12,2,6,10,15],"p":4,"q":4}' },
    { label: 'Root as ancestor', input: '{"root":[9,4,12,2,6,10,15],"p":9,"q":2}' },
    { label: 'Single node', input: '{"root":[1],"p":1,"q":1}' },
    { label: 'Long run: 15 nodes', input: '{"root":[71,42,21,25,36,23,82,9,31,66,35,11,12,85,29],"p":9,"q":29}' },
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
