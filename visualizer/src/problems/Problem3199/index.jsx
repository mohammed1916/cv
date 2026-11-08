import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import TripletXorView from "./TripletXorView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "3199",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with arrays a, b and c (e.g. {"a":[1,2],"b":[3],"c":[0,4]})',
  url: "https://leetcode.com/problems/count-triplets-with-even-xor-set-bits-i/",
  complexity: "O(|a| * |b| * |c|) time and O(1) extra space: every triple is XORed and its set bits counted. The visualization caps each array at 8 values from 0 to 255.",
  examples: [
    { label: "Mixed small arrays", input: '{"a":[1,2],"b":[3],"c":[0,4]}' },
    { label: "Parity split", input: '{"a":[0,5,6],"b":[7],"c":[1,2]}' },
    { label: "Single choice", input: '{"a":[9],"b":[12],"c":[3]}' },
    { label: 'Single values', input: '{"a":[0],"b":[0],"c":[0]}' },
    { label: 'Equal values in every array', input: '{"a":[7,7],"b":[7],"c":[7,7,7]}' },
    { label: 'Largest value 255 with zero', input: '{"a":[255],"b":[0,255],"c":[255,0,128,1,2,3,4,5]}' },
    { label: 'Long run: 8 values each', input: '{"a":[110,92,54,137,17,164,6,230],"b":[124,248,58,161,207,139,144,241],"c":[170,87,87,77,12,178,168,197]}' },
  ],
};

export default function CountTripletsEvenXorI() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <TripletXorView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Final answer: ${run.result}.` : ""}
        </p>
      )}
    />
  );
}
