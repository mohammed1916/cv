import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import SurroundedStory from "./SurroundedStory";
import { code, python, parseInput, buildTrace, pythonLineMap } from "./algorithm";
import "./SurroundedRegionsVisualizer.css";

const definition = {
  phases: [
    { id: "init", label: "Setup", description: "Prepare the board and the border search." },
    { id: "border-scan", label: "Border", description: "Find O cells on the border; they cannot be captured." },
    { id: "flood", label: "Flood", description: "Mark O cells connected to the border as safe." },
    { id: "sweep", label: "Sweep", description: "Visit every cell to decide what to flip." },
    { id: "flip", label: "Flip", description: "Turn an enclosed O into X." },
    { id: "done", label: "Result", description: "Report the captured board." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Board (JSON object, e.g. {\"board\": [[\"X\",\"O\"],[\"X\",\"X\"]]})",
  url: "https://leetcode.com/problems/surrounded-regions/",
  complexity: "O(R*C) time and space for an R by C board. The visualization caps the board at 20 by 20.",
  examples: getExamples("surrounded-regions").map(({ label, input }) => ({ label, input: JSON.stringify({ board: JSON.parse(input) }) })),
};

export default function SurroundedRegionsVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <SurroundedStory story={run} step={step} />
      )}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
