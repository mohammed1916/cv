import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import MinOperationsView from "./MinOperationsView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "2702",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums, x and y (e.g. {"nums":[3,4],"x":3,"y":1})',
  url: "https://leetcode.com/problems/minimum-operations-to-make-numbers-non-positive/",
  complexity: "O(n log max) time and O(1) extra space for n values, using binary search on the number of operations. The visualization caps nums at 8 values from 1 to 50 and x at 10; the official numeric bounds are not verified in the draft.",
  examples: [
    { label: "Example", input: '{"nums":[3,4],"x":3,"y":1}' },
    { label: "Three equal values", input: '{"nums":[1,1,1],"x":2,"y":1}' },
    { label: "Single value", input: '{"nums":[5],"x":3,"y":1}' },
  ],
};

export default function Problem2702Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <MinOperationsView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Answer: ${run.result} operation${run.result === 1 ? "" : "s"}.` : ""}
        </p>
      )}
    />
  );
}
