import AlgorithmStoryWorkspace from "../../components/shared/AlgorithmStoryWorkspace";
import CandyStory from "./CandyStory";
import { CODE, buildCandyStory } from "./algorithm";
import { getExamplesOr } from "../../config/examplesRegistry";
import "./CandyVisualizer.css";

const DEFAULT_EXAMPLES = [
  { label: "Example 1: Valley", input: "[1, 0, 2]" },
  { label: "Example 2: Plateau", input: "[1, 2, 2]" },
  { label: "Two Peaks", input: "[1, 3, 2, 2, 1]" },
  { label: "Steep Valley & Peak", input: "[1, 2, 5, 4, 3, 2, 1]" },
  { label: "Strictly Decreasing", input: "[5, 4, 3, 2, 1]" },
  { label: "Strictly Increasing", input: "[1, 2, 3, 4, 5]" },
  { label: "All Equal Ratings", input: "[3, 3, 3, 3]" },
  { label: "Single Child", input: "[5]" },
];

const registryExamples = getExamplesOr("candy", []);
const EXAMPLES =
  registryExamples.length > 0
    ? registryExamples.map((ex) => ({
        label: ex.label,
        input: JSON.stringify(ex.ratings ?? ex.input ?? ex),
      }))
    : DEFAULT_EXAMPLES;

const definition = {
  title: "Candy",
  inputLabel: "Children ratings (JSON array or comma-separated)",
  inputType: "string",
  initialInput: "[1, 0, 2]",
  examples: EXAMPLES,
  code: CODE.map((text, i) => ({ line: i + 1, text })),
  linePatterns: {
    2: "init",
    3: "init",
    4: "loop",
    5: "compare",
    6: "update",
    7: "loop",
    8: "compare",
    9: "update",
    10: "done",
  },
  patterns: ["init", "loop", "compare", "update", "done"],
  build: (input) => buildCandyStory(input),
  renderStory: ({ story, step }) => <CandyStory story={story} step={step} />,
};

export default function CandyVisualizer() {
  return <AlgorithmStoryWorkspace definition={definition} />;
}
