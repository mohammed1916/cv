import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import SingleNumberStory from "./SingleNumberStory";
import { code, python, parseInput, buildTrace, pythonLineMap } from "./algorithm";
import "./SingleNumberVisualizer.css";

const definition = {
  phases: [
    { id: "init", label: "Setup", description: "Start with result 0." },
    { id: "loop", label: "Scan", description: "XOR each value into the result." },
    { id: "xor", label: "XOR", description: "Pairs of equal values cancel out." },
    { id: "done", label: "Result", description: "Report the value that appears once." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Numbers (JSON object, e.g. {\"nums\": [4,1,2,1,2]})",
  url: "https://leetcode.com/problems/single-number/",
  complexity: "O(n) time and O(1) space for n numbers. The visualization caps the input at 3001 values.",
  examples: getExamples("single-number").map(({ label, nums }) => ({ label, input: JSON.stringify({ nums }) })),
};

export default function SingleNumberVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <SingleNumberStory story={run} step={step} stepIndex={Math.max(0, run.frames.indexOf(step))} />
      )}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
