import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import DeepEqualTreeView from "./DeepEqualTreeView";
import { code, python, parseInput, buildTrace, pythonLineMap, phases } from "./algorithm.js";

const definition = {
  number: "2628",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: 'Two JSON values (e.g. {"o1":{"a":1,"b":[1,2]},"o2":{"b":[1,2],"a":1}})',
  url: "https://leetcode.com/problems/json-deep-equal/description/",
  complexity: "O(N) time for N total nodes across both values, one visit per node pair that is reached, and O(D) stack space for nesting depth D. The visualization caps each value at 20 nodes and depth 4.",
  examples: [
    { label: "Same keys in another order", input: '{"o1":{"a":1,"b":[1,2]},"o2":{"b":[1,2],"a":1}}' },
    { label: "Array order matters", input: '{"o1":[1,2],"o2":[2,1]}' },
    { label: "Array versus object", input: '{"o1":[],"o2":{}}' },
    { label: "Boolean versus number", input: '{"o1":[1,{"x":true}],"o2":[1,{"x":1}]}' },
  ],
};

export default function Problem2628Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <DeepEqualTreeView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Final answer: ${run.result ? "true" : "false"}.` : ""}
        </p>
      )}
    />
  );
}
