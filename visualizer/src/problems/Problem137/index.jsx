import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import SingleNumber2Story from "./SingleNumber2Story";
import { code, python, parseInput, buildTrace, pythonLineMap } from "./algorithm";
import "./SingleNumberIIVisualizer.css";

const definition = {
  phases: [
    { id: "init", label: "Setup", description: "Start with zero counts for every bit." },
    { id: "loop", label: "Scan", description: "Visit each value." },
    { id: "bit", label: "Bit", description: "Look at one bit position." },
    { id: "ones", label: "Ones", description: "Track the bits seen once." },
    { id: "twos", label: "Twos", description: "Track the bits seen twice." },
    { id: "update", label: "Update", description: "Update the counts for this value." },
    { id: "done", label: "Result", description: "Report the value that appears once." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Numbers (JSON object, e.g. {\"nums\": [2,2,3,2]})",
  url: "https://leetcode.com/problems/single-number-ii/",
  complexity: "O(n) time and O(1) space for n numbers. The visualization caps the input at 3001 values.",
  examples: getExamples("single-number-ii").map(({ label, input }) => ({ label, input: JSON.stringify({ nums: JSON.parse(input) }) })),
};

export default function SingleNumberIIVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <SingleNumber2Story story={run} step={step} />
      )}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
