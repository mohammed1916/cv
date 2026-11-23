import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import { MaxDepthScene } from "./MaxDepthBinaryTreeVisualizer";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";
import "./MaxDepthBinaryTreeVisualizer.css";

const definition = {
  phases: [
    { id: "call", label: "Left", description: "Explore the left subtree of the current node." },
    { id: "right", label: "Right", description: "Explore the right subtree after the left depth is known." },
    { id: "return", label: "Return", description: "Return one plus the deeper child depth." },
    { id: "done", label: "Result", description: "Report the maximum depth." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Level-order array (e.g. [3,9,20,null,null,15,7])",
  url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
  complexity: "O(n) time and O(h) recursion depth for n nodes. The visualization accepts up to 15 entries.",
  question: "Return the number of nodes on the longest root-to-leaf path of a binary tree.",
  approaches: [
    { name: "Recursive height", intuition: "A node's depth is one more than the larger of its children's depths.", time: "O(n)", space: "O(h)" },
    { name: "Level-order count", intuition: "Walk the tree one level at a time and count the levels.", time: "O(n)", space: "O(n)" },
  ],
  examples: getExamples("maximum-depth-of-binary-tree").length
    ? getExamples("maximum-depth-of-binary-tree").map(example => ({ label: example.label, input: JSON.stringify(example.root ?? example.arr) }))
    : [{ label: "Sparse right spine", input: "[1,null,2,null,3]" }, { label: "Balanced sample", input: "[3,9,20,null,null,15,7]" }],
};

export default function MaxDepthBinaryTreeWorkspace() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => <MaxDepthScene step={step} />}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
