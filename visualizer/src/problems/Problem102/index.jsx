import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import { LevelOrderScene } from "./BinaryTreeLevelOrderVisualizer";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";
import "./BinaryTreeLevelOrderVisualizer.css";

const definition = {
  phases: [
    { id: "init", label: "Root", description: "Enqueue the root." },
    { id: "level-start", label: "Level", description: "Freeze the size of the current level." },
    { id: "dequeue", label: "Dequeue", description: "Remove the node at the front of the queue." },
    { id: "visit", label: "Visit", description: "Append the node's value to the current level." },
    { id: "enqueue", label: "Children", description: "Enqueue a child for the next level." },
    { id: "level-done", label: "Save level", description: "Save the finished level to the result." },
    { id: "done", label: "Result", description: "Return the grouped levels." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Level-order array (e.g. [3,9,20,null,null,15,7])",
  url: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
  complexity: "O(n) time and O(n) space for n nodes. The visualization accepts up to 15 entries.",
  examples: getExamples("binary-tree-level-order-traversal").length
    ? getExamples("binary-tree-level-order-traversal").map(example => ({ label: example.label, input: JSON.stringify(example.arr ?? example.root) }))
    : [{ label: "Several levels", input: "[3,9,20,null,null,15,7]" }],
};

export default function BinaryTreeLevelOrderWorkspace() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => <LevelOrderScene step={step} />}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
