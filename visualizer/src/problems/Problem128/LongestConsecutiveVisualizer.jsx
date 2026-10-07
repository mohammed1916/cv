import authoredExamples0 from '../../config/examples/local--128.js';

import AlgorithmStoryWorkspace from "../../components/shared/AlgorithmStoryWorkspace";
import ConsecutiveStory from "./ConsecutiveStory";
import { CODE, buildConsecutiveStory } from "./algorithm";
import { consecutiveNarrative } from "./consecutiveNarrative";

import "./LongestConsecutiveVisualizer.css";

const EXAMPLES = authoredExamples0;

const definition = {
  narrative: consecutiveNarrative,
  title: "Longest Consecutive Sequence",
  inputLabel: "Numbers array (JSON array or comma-separated)",
  inputType: "string",
  initialInput: "[100, 4, 200, 1, 3, 2]",
  examples: EXAMPLES,
  code: CODE.map((text, i) => ({ line: i + 1, text })),
  linePatterns: {
    2: "init",
    3: "init",
    4: "scan",
    5: "scan",
    6: "chain",
    7: "chain",
    8: "expand",
    9: "expand",
    10: "expand",
    11: "update",
    12: "done",
  },
  patterns: ["init", "scan", "chain", "expand", "update", "done"],
  build: (input) => buildConsecutiveStory(input),
  renderStory: ({ story, step }) => (
    <ConsecutiveStory story={story} step={step} />
  ),
};

export default function LongestConsecutiveVisualizer() {
  return <AlgorithmStoryWorkspace definition={definition} />;
}
