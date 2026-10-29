import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import TriangleStory from "./TriangleStory";
import { code, python, parseInput, buildTrace, pythonLineMap } from "./algorithm";

const definition = {
  phases: [
    { id: "init", label: "Setup", description: "Start with the bottom row as the best sums." },
    { id: "compare", label: "Compare", description: "Compare the two children below each cell." },
    { id: "update", label: "Update", description: "Add the smaller child sum to the current cell." },
    { id: "done", label: "Result", description: "Report the minimum top-to-bottom path sum." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Triangle rows (JSON object, e.g. {\"triangle\": [[2],[3,4],[6,5,7]]})",
  url: "https://leetcode.com/problems/triangle/",
  complexity: "O(n^2) time and O(n) extra space for n rows. The visualization caps the triangle at 30 rows.",
  examples: getExamples("triangle").map(({ label, input }) => ({ label, input: JSON.stringify({ triangle: JSON.parse(input) }) })),
};

export default function TriangleWorkspace() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <TriangleStory story={run} step={step} />
      )}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
