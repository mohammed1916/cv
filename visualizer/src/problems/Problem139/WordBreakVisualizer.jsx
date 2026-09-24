import { getExamples } from "../../config/examplesRegistry";
import AlgorithmStoryWorkspace from "../../components/shared/AlgorithmStoryWorkspace";
import WordBreakStory from "./WordBreakStory";
import { CODE, buildWordBreakStory } from "./algorithm";
import "./WordBreakVisualizer.css";

const EXAMPLES = getExamples("word-break");

const LINE_PATTERN_MAP = {
  1: "init",
  2: "init",
  3: "init",
  4: "init",
  5: "loop",
  6: "loop",
  7: "check",
  8: "dp",
  9: "dp",
  10: "done",
};

const PATTERNS = ["init", "loop", "check", "dp", "done"];

const definition = {
  title: "Word Break",
  inputLabel: 'String s | wordDict (e.g. "leetcode | leet, code")',
  inputType: "string",
  initialInput: "leetcode | leet, code",
  examples: EXAMPLES,
  code: CODE.map((text, i) => ({ line: i + 1, text })),
  linePatterns: LINE_PATTERN_MAP,
  patterns: PATTERNS,
  build: (input) => buildWordBreakStory(input),
  renderStory: ({ story, step, stepIndex }) => (
    <WordBreakStory story={story} step={step} stepIndex={stepIndex} />
  ),
};

export default function WordBreakVisualizer() {
  return <AlgorithmStoryWorkspace definition={definition} />;
}
