import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2913",
  phases: [
    { id: "start", label: "Start", description: "Fix the left endpoint of the subarray." },
    { id: "extend", label: "Extend", description: "Extend the right endpoint and count distinct values." },
    { id: "result", label: "Result", description: "Report the total of squared distinct counts." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with key nums (e.g. {"nums": [2,5,2,5]})',
  url: "https://leetcode.com/problems/subarrays-distinct-element-sum-of-squares-i/",
  complexity: "O(n^2) time and O(n) space for array length n. The visualization caps nums at 50 elements.",
  examples: [
    { label: "Example 1", input: '{"nums": [2,5,2,5]}' },
    { label: "Example 2", input: '{"nums": [7,7,3]}' },
    { label: "Single element", input: "{\"nums\":[1]}" },
    { label: "Equal values", input: "{\"nums\":[2,2,2,2]}" },
    { label: "Maximum values, 50 entries", input: "{\"nums\":[100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1,100,1]}" },
    { label: "Long run: 50 values", input: "{\"nums\":[37,50,38,50,81,71,96,40,40,93,50,60,22,53,13,26,85,60,16,84,67,7,79,14,100,27,83,11,56,37,4,90,50,80,55,60,81,67,16,37,1,58,67,11,34,57,53,73,98,98]}" },
  ],
};

export default function Problem2913() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => <>
      <IndexedSequence label="nums" length={step.values.length} valueAt={i => String(step.values[i])}
        active={step.active} roleAt={i => step.marks[i] || ""} />
      <p>{step.summary}</p>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>} />;
}
