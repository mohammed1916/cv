import { getExamples as getAuthoredExamples } from '../../config/examplesRegistry';
import { singleNumberNarrative } from './singleNumberNarrative.js';
import AlgorithmStoryWorkspace from "../../components/shared/AlgorithmStoryWorkspace";
import SingleNumberStory from "./SingleNumberStory";
import { CODE, buildSingleNumberStory } from "./algorithm";

import "./SingleNumberVisualizer.css";

const EXAMPLES = getAuthoredExamples('local:136');

const definition = {
  narrative: singleNumberNarrative,
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
