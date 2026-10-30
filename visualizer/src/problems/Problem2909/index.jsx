import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, parseInput, buildTrace } from "./algorithm";

const definition = {
  number: "2909",
  phases: [
    { id: "suffix", label: "Suffix", description: "Smallest value at or after each index." },
    { id: "scan", label: "Scan", description: "Treat each index as the peak j." },
    { id: "record", label: "Record", description: "Keep the smallest valid triplet sum." },
    { id: "result", label: "Result", description: "Report the minimum sum or -1." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with key nums (e.g. {"nums": [8,6,1,5,3]})',
  url: "https://leetcode.com/problems/minimum-sum-of-mountain-triplets-ii/",
  complexity: "O(n) time and O(n) space for array length n. The visualization caps nums at 50 elements.",
  examples: [
    { label: "Example 1", input: '{"nums": [8,6,1,5,3]}' },
    { label: "Example 2", input: '{"nums": [5,4,8,7,10,2]}' },
    { label: "Example 3", input: '{"nums": [6,5,4,3,4,5]}' },
  ],
};

export default function Problem2909() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <IndexedSequence label="nums" length={step.values.length} valueAt={i => String(step.values[i])}
        active={step.active} roleAt={i => step.marks[i] || ""} />
      <p>{step.summary}</p>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>} />;
}
