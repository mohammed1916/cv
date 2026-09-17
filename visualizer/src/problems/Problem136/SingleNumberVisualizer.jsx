import AlgorithmStoryWorkspace from "../../components/shared/AlgorithmStoryWorkspace";
import SingleNumberStory from "./SingleNumberStory";
import { CODE, buildSingleNumberStory } from "./algorithm";
import { getExamples } from "../../config/examplesRegistry";
import "./SingleNumberVisualizer.css";

const registryExamples = getExamples("single-number") || [];
const EXAMPLES = [
  ...registryExamples.map((ex) => ({
    label: ex.label,
    input: JSON.stringify(ex.nums),
  })),
  { label: "Single [1]", input: "[1]" },
  { label: "Negative [-2, 1, -2]", input: "[-2, 1, -2]" },
  { label: "Alternating [10, 25, 10, 8, 25]", input: "[10, 25, 10, 8, 25]" },
];

const definition = {
  title: "Single Number",
  inputLabel: "Numbers array (JSON or comma-separated)",
  inputType: "string",
  initialInput: "[4, 1, 2, 1, 2]",
  examples: EXAMPLES,
  code: CODE.map((text, i) => ({ line: i + 1, text })),
  linePatterns: {
    2: "init",
    3: "loop",
    4: "xor",
    5: "done",
  },
  patterns: ["init", "loop", "xor", "done"],
  build: (input) => buildSingleNumberStory(input),
  renderStory: ({ story, step, stepIndex }) => (
    <SingleNumberStory story={story} step={step} stepIndex={stepIndex} />
  ),
};

export default function SingleNumberVisualizer() {
  return <AlgorithmStoryWorkspace definition={definition} />;
}
