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
