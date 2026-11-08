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
  inputLabel: 'Object with root (level-order list) and nodes, e.g. {"root":[9,4,12,2,6,10,15],"nodes":[2,6]}',
  url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree-iv/",
  complexity: "O(n) time and O(h) recursion space for n nodes. The visualization caps the tree at 15 nodes and the target list at 6.",
  examples: [
    { label: "Two targets", input: '{"root":[9,4,12,2,6,10,15],"nodes":[2,6]}' },
    { label: "Three targets", input: '{"root":[9,4,12,2,6,10,15],"nodes":[2,6,10]}' },
    { label: "One target", input: '{"root":[9,4,12,2,6,10,15],"nodes":[15]}' },
    { label: 'One target', input: '{"root":[1],"nodes":[1]}' },
    { label: 'Targets in order', input: '{"root":[2,1,3],"nodes":[3,1]}' },
    { label: 'Six nodes', input: '{"root":[9,4,12,2,6,10,15],"nodes":[2,6,10,15,4,12]}' },
    { label: 'Long run: 15 nodes', input: '{"root":[52,75,44,29,83,8,33,80,16,49,92,56,5,43,13],"nodes":[52,75,44,29,83,8]}' },
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
