import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import ZigzagStory from "./ZigzagStory";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";
import "./BinaryTreeZigzagLevelOrderTraversalVisualizer.css";

const definition = {
  phases: [
    { id: "init", label: "Root", description: "Enqueue the root." },
    { id: "done", label: "Empty", description: "An empty tree has no rows." },
    { id: "level-start", label: "Level", description: "Freeze the size of the current level." },
    { id: "dequeue", label: "Dequeue", description: "Remove the node at the front of the queue." },
    { id: "visit", label: "Visit", description: "Add the node's value to the working row." },
    { id: "enqueue", label: "Children", description: "Enqueue a child for the next level." },
    { id: "level-done", label: "Save row", description: "Save the finished working row." },
    { id: "reverse", label: "Reverse", description: "Reverse an odd-numbered row for the zigzag output." },
    { id: "direction", label: "Direction", description: "Flip the output direction for the next row." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Level-order array (e.g. [3,9,20,null,null,15,7])",
  url: "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/",
  complexity: "O(n) time and O(n) space for n nodes. The visualization accepts up to 15 entries.",
  examples: getExamples("binary-tree-zigzag-level-order-traversal").map(example => ({ label: example.label, input: JSON.stringify(example.root) })),
};

export default function BinaryTreeZigzagWorkspace() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => <ZigzagStory step={step} />}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
