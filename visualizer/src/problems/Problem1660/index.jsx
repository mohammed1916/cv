import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import Problem1660View from "./Problem1660View";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "1660",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with root (level-order list) and bad [from, to], e.g. {"root":[1,2,3,4,5,6,7],"bad":[2,3]}',
  url: "https://leetcode.com/problems/correct-a-binary-tree/",
  complexity: "O(n) time and O(n) space for n nodes. The visualization caps the tree at 15 nodes.",
  examples: [
    { label: "Depth one", input: '{"root":[1,2,3,4,5,6,7],"bad":[2,3]}' },
    { label: "Depth two", input: '{"root":[1,2,3,4,5,6,7],"bad":[4,5]}' },
    { label: 'Two children', input: '{"root":[1,2,3],"bad":[2,3]}' },
    { label: 'Last level pair', input: '{"root":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],"bad":[8,9]}' },
    { label: 'Missing node beside', input: '{"root":[1,2,3,null,4,5,6],"bad":[4,5]}' },
    { label: 'Long run: 15 entries', input: '{"root":[25,20,60,38,41,8,31,15,37,83,18,13,84,12,70],"bad":[83,18]}' },
  ],
};

export default function Problem1660() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <Problem1660View run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
