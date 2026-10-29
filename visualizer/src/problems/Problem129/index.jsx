import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import SumNumbersStory from "./SumNumbersStory";
import { code, python, parseInput, buildTrace, pythonLineMap } from "./algorithm";
import "./SumRootToLeafNumbersVisualizer.css";

const definition = {
  phases: [
    { id: "init", label: "Setup", description: "Build the tree from its level-order array." },
    { id: "compute", label: "Compute", description: "Extend the number built along the path." },
    { id: "recurse-left", label: "Left", description: "Descend into the left child." },
    { id: "recurse-right", label: "Right", description: "Descend into the right child." },
    { id: "null", label: "Empty", description: "A missing child contributes nothing." },
    { id: "leaf", label: "Leaf", description: "A leaf completes one root-to-leaf number." },
    { id: "combine", label: "Combine", description: "Add the child sums together." },
    { id: "done", label: "Result", description: "Report the total of every root-to-leaf number." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Level-order digits (JSON object, e.g. {\"root\": [4,9,0,5,1]})",
  url: "https://leetcode.com/problems/sum-root-to-leaf-numbers/",
  complexity: "O(n) time and O(h) stack space for n nodes. The visualization caps the array at 15 slots.",
  examples: getExamples("sum-root-to-leaf-numbers").map(({ label, input }) => ({ label, input: JSON.stringify({ root: JSON.parse(input) }) })),
};

export default function SumRootToLeafNumbersVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <SumNumbersStory story={run} step={step} stepIndex={Math.max(0, run.frames.indexOf(step))} />
      )}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
