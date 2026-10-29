import AlgorithmWorkspace from "../../components/shared/AlgorithmWorkspace";
import { getExamples } from "../../config/examplesRegistry";
import CandyStory from "./CandyStory";
import { code, python, parseInput, buildTrace, pythonLineMap } from "./algorithm";
import "./CandyVisualizer.css";

const definition = {
  phases: [
    { id: "init", label: "Setup", description: "Give every child one candy." },
    { id: "loop", label: "Scan", description: "Visit each child." },
    { id: "left", label: "Left pass", description: "Enforce the rule against the left neighbour." },
    { id: "right", label: "Right pass", description: "Enforce the rule against the right neighbour." },
    { id: "compare", label: "Compare", description: "Compare with a neighbour's rating." },
    { id: "update", label: "Update", description: "Raise this child's candies when needed." },
    { id: "done", label: "Result", description: "Report the total number of candies." },
  ],
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  inputLabel: "Ratings (JSON object, e.g. {\"ratings\": [1,0,2]})",
  url: "https://leetcode.com/problems/candy/",
  complexity: "O(n) time and O(n) space for n children. The visualization caps the line at 40 children.",
  examples: getExamples("candy").map(({ label, ratings }) => ({ label, input: JSON.stringify({ ratings }) })),
};

export default function CandyVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <CandyStory story={run} step={step} />
      )}
      renderReasoning={({ step }) => <p>{step.explanation ?? step.message}</p>}
    />
  );
}
