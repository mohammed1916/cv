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
  inputLabel: 'JSON object with key nums (e.g. {"nums": [1,2,1]})',
  url: "https://leetcode.com/problems/subarrays-distinct-element-sum-of-squares-i/",
  complexity: "O(n^2) time and O(n) space for array length n. The visualization caps nums at 50 elements.",
  examples: [
    { label: "Example 1", input: '{"nums": [1,2,1]}' },
    { label: "Example 2", input: '{"nums": [1,1]}' },
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
