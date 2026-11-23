import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import MinimumDepthStory, { MinimumDepthComparison } from "./MinimumDepthStory";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";
import "./Visualizer.css";

const definition = {
  phases: [
    { id: "init", label: "Setup", description: "Depth counts nodes, including the root." },
    { id: "visit", label: "Visit", description: "Visit a node and check whether it has children." },
    { id: "missing_child", label: "Missing child", description: "A missing child is not a leaf; follow the existing child." },
    { id: "compare", label: "Both children", description: "Explore both children, then compare their routes." },
    { id: "leaf", label: "Leaf", description: "A real leaf ends a route." },
    { id: "return", label: "Return", description: "Return one more than the shorter complete route." },
    { id: "done", label: "Result", description: "Report the shortest root-to-leaf route." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Level-order array (e.g. [3,9,20,null,null,15,7])",
  url: "https://leetcode.com/problems/minimum-depth-of-binary-tree/",
  complexity: "O(n) time and O(h) recursion depth for n nodes. The visualization accepts up to 15 entries.",
  question: "Return the number of nodes on the shortest root-to-leaf path of a binary tree.",
  approaches: [
    { name: "Recursive minimum depth", intuition: "A node's depth is one more than its shallower child, unless it has only one child.", time: "O(n)", space: "O(h)" },
    { name: "Level-order search", intuition: "Stop at the first level that contains a leaf.", time: "O(n)", space: "O(n)" },
  ],
  examples: getExamples("minimum-depth-of-binary-tree").map(example => ({ label: example.label, input: JSON.stringify(example.arr) })),
};

export default function MinimumDepthOfBinaryTreeWorkspace() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <MinimumDepthStory run={run} stepIndex={step.index} />}
      renderReasoning={({ run, step }) => <MinimumDepthComparison run={run} stepIndex={step.index} />}
    />
  );
}
