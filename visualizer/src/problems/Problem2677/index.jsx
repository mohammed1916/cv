import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import ChunkBandView from "./ChunkBandView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "2677",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with arr and size (e.g. {"arr":[1,2,3,4,5],"size":2})',
  url: "https://leetcode.com/problems/chunk-array/",
  complexity: "O(n) time and O(n) space for n values, since the chunks hold every value once. The visualization caps arr at 12 integers from -99 to 99 and size at 12; the page caps arr and size for teaching.",
  examples: [
    { label: "Example", input: '{"arr":[1,2,3,4,5],"size":2}' },
    { label: "Size larger than the array", input: '{"arr":[7,8,9],"size":5}' },
    { label: "Empty", input: '{"arr":[],"size":3}' },
    { label: 'Single value, size 1', input: '{"arr":[5],"size":1}' },
    { label: 'Size equals length, equal values', input: '{"arr":[3,3,3],"size":3}' },
    { label: 'Largest: 12 values, size 12', input: '{"arr":[99,-99,99,-99,99,-99,99,-99,99,-99,99,-99],"size":12}' },
    { label: 'Long run: 12 values, size 4', input: '{"arr":[29,95,78,-94,-63,-49,51,-4,47,33,-28,-41],"size":4}' },
  ],
};

export default function Problem2677Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ChunkBandView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
