import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import Problem1918View from "./Problem1918View";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "1918",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums and k, e.g. {"nums":[3,1,2],"k":3}',
  url: "https://leetcode.com/problems/kth-smallest-subarray-sum/",
  complexity: "O(n log S) time and O(1) space for n values with total sum S. The visualization shows up to 10 entries of 1 to 9 so the window and search bounds fit on screen.",
  examples: [
    { label: "Third smallest", input: '{"nums":[3,1,2],"k":3}' },
    { label: "First smallest", input: '{"nums":[3,1,2],"k":1}' },
    { label: "Repeated values", input: '{"nums":[2,2,2],"k":4}' },
  ],
};

export default function Problem1918() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <Problem1918View run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
