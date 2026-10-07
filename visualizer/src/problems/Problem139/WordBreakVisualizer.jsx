import authoredExamples0 from '../../config/examples/word-break.js';
import { wordBreakNarrative } from './wordBreakNarrative.js';

import AlgorithmStoryWorkspace from "../../components/shared/AlgorithmStoryWorkspace";
import WordBreakStory from "./WordBreakStory";
import { CODE, buildWordBreakStory } from "./algorithm";
import "./WordBreakVisualizer.css";

const EXAMPLES = authoredExamples0;

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
  narrative: wordBreakNarrative,
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
