import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import DifferenceTableView from "./DifferenceTableView";
import { buildTrace, parseInput, code, python } from "./algorithm.js";

const definition = {
  phases: [
    { id: "start", label: "Start", description: "No range has been started yet." },
    { id: "index", label: "Index", description: "Extend the ranges that ended just before this index." },
    { id: "extend", label: "Choose", description: "Each difference splits into a nums1 pick and a nums2 pick." },
    { id: "count", label: "Count", description: "Start a range here and add the balanced ways." },
    { id: "done", label: "Result", description: "Report the total modulo 1000000007." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums1 and nums2 (e.g. {"nums1":[1,2],"nums2":[2,1]})',
  url: "https://leetcode.com/problems/choose-numbers-from-two-arrays-in-range/",
  complexity: "O(n * D) time and O(D) space for n indices, where D is the number of distinct differences; with values up to 9 and length up to 8, D stays small. Each range and each choice is counted separately, and the total is taken modulo 1000000007. The visualization caps each array at 8 values from 0 to 9 so every difference can be shown.",
  examples: [
    { label: "Three indices", input: '{"nums1":[1,2,3],"nums2":[3,2,1]}' },
    { label: "Mixed values", input: '{"nums1":[4,0,2,5],"nums2":[1,3,2,0]}' },
    { label: 'One index', input: '{"nums1":[7],"nums2":[2]}' },
    { label: 'Equal values cancel', input: '{"nums1":[2,2],"nums2":[2,2]}' },
    { label: 'All zeros', input: '{"nums1":[0,0,0],"nums2":[0,0,0]}' },
    { label: 'Largest values, eight indices', input: '{"nums1":[9,9,9,9,9,9,9,9],"nums2":[0,0,0,0,0,0,0,0]}' },
    { label: 'Long run: 8 indices', input: '{"nums1":[8,7,3,5,1,7,9,0],"nums2":[3,8,3,4,1,6,9,3]}' },
  ],
};

export default function ChooseNumbersFromTwoArrays() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <DifferenceTableView run={run} step={step} />}
      renderReasoning={({ run, step }) => (
        <p>
          {step.message} {run && step.phase === "done" ? `Answer: ${run.result}.` : ""}
        </p>
      )}
    />
  );
}
