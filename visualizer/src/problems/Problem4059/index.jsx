import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import BitRunView from "./BitRunView";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "4059",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums (1 to 10 values from 0 to 32767)',
  url: "https://leetcode.com/problems/lexicographically-largest-power-array/",
  complexity: "This trace picks each position by scanning the pool, so it costs O(n^2) time with O(n) space; each pick is checked against 15 bits. The visualization caps the array at 10 values. The official limit of 50000 elements needs a faster selection (for example, counting equal values) that is not shown here, and the bounds are not verified in this draft.",
  examples: [
    { label: "Small mix", input: '{"nums":[1,2,3]}' },
    { label: "High bits", input: '{"nums":[24576,16384,8192,16384]}' },
    { label: "Single value", input: '{"nums":[12345]}' },
    { label: "Single zero", input: "{\"nums\":[0]}" },
    { label: "Equal values", input: "{\"nums\":[5,5,5]}" },
    { label: "Largest 15-bit value", input: "{\"nums\":[32767,0,32767]}" },
    { label: "Long run: ten values", input: "{\"nums\":[2989,4807,29170,1644,30546,31155,9400,16909,4460,30049]}" },
  ],
};

export default function Problem4059Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <BitRunView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message} Each position goes to the element that keeps the most still-unbroken bits set, so a bit's run ends as late as possible; a plain descending sort is not enough.</p>}
    />
  );
}
