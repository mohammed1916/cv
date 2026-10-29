import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import { LevelOrderIIScene } from "./BinaryTreeLevelOrderTraversalIIVisualizer";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";
import "./BinaryTreeLevelOrderTraversalII.css";

const definition = {
  phases: [
    { id: "init", label: "Root", description: "Enqueue the root." },
    { id: "level-start", label: "Level", description: "Freeze the size of the current level." },
    { id: "dequeue", label: "Dequeue", description: "Remove the node at the front of the queue." },
    { id: "visit", label: "Visit", description: "Add the node's value to the current row." },
    { id: "enqueue", label: "Children", description: "Enqueue a child for the next level." },
    { id: "level-done", label: "Save row", description: "Save the finished row to the result." },
    { id: "done", label: "Reverse", description: "Reverse the order of the levels." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Level-order array (e.g. [3,9,20,null,null,15,7])",
  url: "https://leetcode.com/problems/binary-tree-level-order-traversal-ii/",
  complexity: "O(n) time and O(n) space for n nodes. The visualization accepts up to 15 entries.",
  examples: getExamples("binary-tree-level-order-traversal-ii").map(example => ({ label: example.label, input: JSON.stringify(example.arr ?? example.root) })),
};

export default function BinaryTreeLevelOrderTraversalIIWorkspace() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => <LevelOrderIIScene step={step} />}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
