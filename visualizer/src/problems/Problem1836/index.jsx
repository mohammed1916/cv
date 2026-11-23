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
  complexity: "O(n) expected time and O(n) space for n nodes (a hash map of counts). The visualization shows at most 12 nodes so every count stays visible.",
  question: "Delete every node whose value appears more than once in the list, keeping only values that are unique in the whole list and their original order.",
  approaches: [
    { name: "Count then copy", intuition: "Count every value in a hash map, then copy only the nodes whose count is one.", time: "O(n)", space: "O(n)" },
    { name: "Sort and compare neighbours", intuition: "Sort a copy of the values so equal values sit together, then keep the ones with no equal neighbour.", time: "O(n log n)", space: "O(n)" },
  ],
  examples: [
    { label: "Value 2 repeats", input: "[1,2,3,2]" },
    { label: "Mixed repeats", input: "[1,1,1,2,3]" },
    { label: "All repeat", input: "[4,4]" },
  { label: 'Single value', input: "[9]" },
  { label: 'Twelve equal values', input: "[6,6,6,6,6,6,6,6,6,6,6,6]" },
  { label: 'Twelve distinct values', input: "[1,2,3,4,5,6,7,8,9,10,11,12]" },
  { label: 'Long run: 12 values', input: "[3,3,3,3,3,3,3,3,3,3,3,3]" },
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
