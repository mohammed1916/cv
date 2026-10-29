import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import { TreeVisualizationPanel, StatePanel } from "./BalancedBinaryTreeVisualizer";
import { code, python, pythonLineMap, parseInput, buildTrace } from "./algorithm";
import "./BalancedBinaryTreeVisualizer.css";

const definition = {
  phases: [
    { id: "recurse-left", label: "Left height", description: "Ask the left subtree for its height." },
    { id: "recurse-right", label: "Right height", description: "Measure the right subtree after the left result is known." },
    { id: "propagate", label: "Propagate", description: "A child subtree already failed, so return -1 without comparing." },
    { id: "compare", label: "Compare", description: "Compare the two child heights against the limit of 1." },
    { id: "unbalanced", label: "Unbalanced", description: "The first imbalance makes the whole tree unbalanced." },
    { id: "balanced", label: "Height", description: "Return one plus the larger child height." },
    { id: "done", label: "Result", description: "Report whether every node is balanced." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Level-order array (e.g. [3,9,20,null,null,15,7])",
  url: "https://leetcode.com/problems/balanced-binary-tree/",
  complexity: "O(n) time and O(h) recursion depth for n nodes. The visualization accepts up to 15 entries.",
  examples: getExamples("balanced-binary-tree").map(example => ({ label: example.label, input: JSON.stringify(example.arr) })),
};

export default function BalancedBinaryTreeWorkspace() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ step }) => <TreeVisualizationPanel step={step} positions={step.positions} edges={step.edges} allNodes={step.allNodes} />}
      renderReasoning={({ step }) => <StatePanel step={step} allNodes={step.allNodes} />}
    />
  );
}
