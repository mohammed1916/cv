import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import ParityTallyView from "./ParityTallyView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "3215",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with arrays a, b and c (e.g. {"a":[1,2],"b":[3],"c":[0,4]})',
  url: "https://leetcode.com/problems/count-triplets-with-even-xor-set-bits-ii/",
  complexity: "O(|a| + |b| + |c|) time and O(1) extra space: each array is tallied once by set-bit parity, then the pair counts combine. The visualization caps each array at 40 values from 0 to 1023.",
  examples: [
    { label: "Mixed small arrays", input: '{"a":[1,2],"b":[3],"c":[0,4]}' },
    { label: "Parity split", input: '{"a":[0,5,6],"b":[7],"c":[1,2]}' },
    { label: "Single choice", input: '{"a":[9],"b":[12],"c":[3]}' },
  ],
};

export default function CountTripletsEvenXorII() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ParityTallyView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run ? `Final answer: ${run.result}.` : ""}
        </p>
      )}
    />
  );
}
