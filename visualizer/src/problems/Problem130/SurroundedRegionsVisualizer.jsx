import { getExamples } from "../../config/examplesRegistry";
import AlgorithmStoryWorkspace from "../../components/shared/AlgorithmStoryWorkspace";
import SurroundedStory from "./SurroundedStory";
import { CODE, buildSurroundedStory } from "./algorithm";
import "./SurroundedRegionsVisualizer.css";

const EXAMPLES = getExamples("surrounded-regions");

const definition = {
  title: "Surrounded Regions",
  inputLabel: "2D Board matrix (JSON array of 'X' and 'O')",
  inputType: "string",
  initialInput: JSON.stringify([
    ["X", "X", "X", "X"],
    ["X", "O", "O", "X"],
    ["X", "X", "O", "X"],
    ["X", "O", "X", "X"],
  ]),
  examples: EXAMPLES,
  code: CODE.map((text, i) => ({ line: i + 1, text })),
  linePatterns: {
    1: "init",
    2: "init",
    3: "init",
    4: "border-scan",
    5: "border-scan",
    6: "border-scan",
    7: "border-scan",
    8: "border-scan",
    9: "border-scan",
    10: "border-scan",
    11: "border-scan",
    12: "border-scan",
    13: "sweep",
    14: "sweep",
    15: "sweep",
    16: "sweep",
  },
  patterns: ["init", "border-scan", "sweep", "done"],
  build: (input) => buildSurroundedStory(input),
  renderStory: ({ story, step }) => <SurroundedStory story={story} step={step} />,
};

export default function SurroundedRegionsVisualizer() {
  return <AlgorithmStoryWorkspace definition={definition} />;
}
