import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import SortedTreeStory from "../../components/shared/SortedTreeStory.jsx";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";
import "./ConvertSortedArrayToBinarySearchTreeVisualizer.css";

const definition = {
  phases: [
    { id: "init", label: "Setup", description: "Use the sorted array directly; each interval is a range of indices." },
    { id: "compare", label: "Midpoint", description: "Choose the middle index of the current interval." },
    { id: "update", label: "Create", description: "Create the node for the midpoint value." },
    { id: "visit", label: "Recurse", description: "Build the left interval, then the right interval." },
    { id: "return", label: "Return", description: "Return the finished subtree to its parent." },
    { id: "done", label: "Result", description: "The balanced tree is complete." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Strictly increasing array (e.g. [-10,-3,0,5,9])",
  url: "https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/",
  complexity: "O(n) time and O(log n) recursion depth for n values. The visualization accepts up to 15 values.",
  examples: getExamples("convert-sorted-array-to-binary-search-tree").map(example => ({ label: example.label, input: JSON.stringify(example.arr) })),
};

export default function ConvertSortedArrayToBinarySearchTreeWorkspace() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SortedTreeStory story={run.story} values={run.input} stepIndex={step.index} sourceKind="array" />}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
