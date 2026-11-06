import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import SortedTreeStory from "../../components/shared/SortedTreeStory.jsx";
import IndexedSequence from "../../components/shared/IndexedSequence";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";
import "./ConvertSortedListToBinarySearchTreeVisualizer.css";

const definition = {
  phases: [
    { id: "init", label: "Read list", description: "Read the linked list in order before choosing subtree roots." },
    { id: "visit", label: "Copy / split", description: "Copy each list node, then split the interval around a midpoint." },
    { id: "compare", label: "Midpoint", description: "Choose the middle index of the current interval." },
    { id: "update", label: "Create", description: "Create the node for the midpoint value." },
    { id: "return", label: "Return", description: "Return the finished subtree to its parent." },
    { id: "done", label: "Result", description: "The balanced tree is complete." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Strictly increasing list (e.g. [-10,-3,0,5,9])",
  url: "https://leetcode.com/problems/convert-sorted-list-to-binary-search-tree/",
  complexity: "O(n) time and O(log n) recursion depth for n nodes. The visualization accepts up to 15 values.",
  examples: getExamples("convert-sorted-list-to-binary-search-tree").map(example => ({ label: example.label, input: JSON.stringify(example.list) })),
};

export default function ConvertSortedListToBinarySearchTreeWorkspace() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <>
        <IndexedSequence label="Sorted values" length={run.input.length} valueAt={i => run.input[i]} active={step.mid ?? -1}
          roleAt={i => (i === step.lo ? "lo" : i === (step.hi ?? 0) - 1 ? "hi" : "")} />
        <SortedTreeStory story={run.story} values={run.input} stepIndex={step.index} sourceKind="list" />
      </>}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
