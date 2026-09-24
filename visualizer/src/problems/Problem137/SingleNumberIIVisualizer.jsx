import { getExamples } from "../../config/examplesRegistry";
import AlgorithmStoryWorkspace from "../../components/shared/AlgorithmStoryWorkspace";
import SingleNumber2Story from "./SingleNumber2Story";
import { CODE, buildSingleNumber2Story } from "./algorithm";
import "./SingleNumberIIVisualizer.css";

const EXAMPLES = getExamples("single-number-ii");

const definition = {
  title: "Single Number II (Modulo 3 Bit Counter)",
  inputLabel: "Integer array (elements appear 3× except 1 appearing once)",
  inputType: "string",
  initialInput: "[2, 2, 3, 2]",
  examples: EXAMPLES,
  code: CODE.map((text, i) => ({ line: i + 1, text })),
  linePatterns: {
    2: "init",
    3: "loop",
    4: "update",
    5: "update",
    6: "done",
  },
  patterns: ["init", "loop", "update", "done"],
  build: (input) => buildSingleNumber2Story(input),
  renderStory: ({ story, step }) => <SingleNumber2Story story={story} step={step} />,
};

export default function SingleNumberIIVisualizer() {
  return <AlgorithmStoryWorkspace definition={definition} />;
}
