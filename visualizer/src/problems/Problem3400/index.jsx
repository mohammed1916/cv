import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import ShiftMatchView from "./ShiftMatchView";
import { code, python, parseInput, buildTrace } from "./algorithm.js";

const definition = {
  number: "3400",
  phases: [
    { id: "start", label: "Setup", description: "Start with no shift counted." },
    { id: "shift", label: "Shift", description: "Slide nums1 right by k places." },
    { id: "match", label: "Match", description: "The aligned values agree." },
    { id: "miss", label: "Miss", description: "The aligned values differ." },
    { id: "record", label: "Record", description: "Keep the best count so far." },
    { id: "done", label: "Result", description: "Report the largest count." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums1 and nums2 (equal-length digit arrays, e.g. {"nums1":[1,2],"nums2":[2,2]})',
  url: "https://leetcode.com/problems/maximum-number-of-matching-indices-after-right-shifts/",
  complexity: "O(n^2) time and O(n) extra space for arrays of length n: every shift is compared index by index. The visualization caps each array at 12 digits, so it is a teaching view rather than the full limit.",
  examples: [
    { label: "Mixed matches", input: '{"nums1":[2,7,1,8,2],"nums2":[8,2,7,1,2]}' },
    { label: "No matches", input: '{"nums1":[4,4,4],"nums2":[1,2,3]}' },
    { label: "Alternating", input: '{"nums1":[6,1,6,1],"nums2":[1,6,1,6]}' },
    { label: 'Single matching zero', input: '{"nums1":[0],"nums2":[0]}' },
    { label: 'Identical lists', input: '{"nums1":[4,4,4],"nums2":[4,4,4]}' },
    { label: 'Largest digits, twelve values', input: '{"nums1":[9,9,9,9,9,9,9,9,9,9,9,9],"nums2":[0,9,9,0,9,9,0,9,9,0,9,9]}' },
    { label: 'Long run: 12 values', input: '{"nums1":[0,3,5,6,8,3,5,3,0,2,1,4],"nums2":[5,2,3,7,4,0,0,4,1,1,5,0]}' },
  ],
};

export default function Problem3400Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <ShiftMatchView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.phase === "done"
            ? `The best shift gives ${run.result} matching indices.`
            : "Shifting nums1 by k moves the value at index (i - k) mod n onto index i, so every shift is one full comparison pass."}
        </p>
      )}
    />
  );
}
