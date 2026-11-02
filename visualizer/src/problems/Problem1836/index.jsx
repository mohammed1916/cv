import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import Problem1836View from "./Problem1836View";
import { code, python, parseInput, buildTrace, phases } from "./algorithm.js";

const definition = {
  number: "1836",
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: "A JSON array of integers, e.g. [1,2,3,2]",
  url: "https://leetcode.com/problems/remove-duplicates-from-an-unsorted-linked-list/",
  complexity: "O(n) expected time and O(n) space for n nodes (a hash map of counts). The visualization caps the list at 12 nodes; the official bounds are not verified in this draft.",
  examples: [
    { label: "Value 2 repeats", input: "[1,2,3,2]" },
    { label: "Mixed repeats", input: "[1,1,1,2,3]" },
    { label: "All repeat", input: "[4,4]" },
  ],
};

export default function Problem1836() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <Problem1836View run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  );
}
