import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import SmallerSidesView from "./SmallerSidesView";
import { buildTrace, code, parseInput, phases, python } from "./algorithm.js";

const definition = {
  number: "2519",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums and k (e.g. {"nums":[2,3,6,5,2,3],"k":2})',
  url: "https://leetcode.com/problems/count-the-number-of-k-big-indices/description/",
  complexity: "O(n^2) time and O(n) space for n values, counting each side by scanning. The visualization caps the array at 12 values of 1 to 20 and k at 12;",
  examples: [
    { label: "Example", input: '{"nums":[2,3,6,5,2,3],"k":2}' },
    { label: "k zero", input: '{"nums":[1,1,1],"k":0}' },
    { label: "Impossible", input: '{"nums":[5,4,3],"k":1}' },
    { label: 'Single value', input: '{"nums":[4],"k":1}' },
    { label: 'Equal values', input: '{"nums":[3,3,3,3],"k":3}' },
    { label: 'Largest array, k = 12', input: '{"nums":[20,20,20,20,20,20,20,20,20,20,20,20],"k":12}' },
    { label: 'Long run: 12 numbers', input: '{"nums":[5,18,20,13,1,3,5,15,9,18,14,10],"k":6}' },
  ],
};

export default function CountKBigIndices() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SmallerSidesView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          For each index, count the strictly smaller values to its left and to its right. The index is k-big when both counts reach k. Equal values never count as smaller.
          {run ? ` Final answer: ${run.result}.` : ""} {step.message}
        </p>
      )}
    />
  );
}
