import AlgorithmStoryWorkspace from "../../components/shared/AlgorithmStoryWorkspace";
import WordBreakStory from "./WordBreakStory";
import { CODE, buildWordBreakStory } from "./algorithm";
import "./WordBreakVisualizer.css";

const EXAMPLES = [
  {
    label: "leetcode (leet, code)",
    input: "leetcode | leet, code",
  },
  {
    label: "applepenapple (apple, pen)",
    input: "applepenapple | apple, pen",
  },
  {
    label: "catsandog (cats, dog, sand, and, cat)",
    input: "catsandog | cats, dog, sand, and, cat",
  },
  {
    label: "cars (car, ca, rs)",
    input: "cars | car, ca, rs",
  },
  {
    label: "single char match (a | a)",
    input: "a | a",
  },
  {
    label: "single char mismatch (a | b)",
    input: "a | b",
  },
  {
    label: "repeated letters (aaaaaaa | aaaa, aaa)",
    input: "aaaaaaa | aaaa, aaa",
  },
  {
    label: "goalspecial (go, goal, goals, special)",
    input: "goalspecial | go, goal, goals, special",
  },
];

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
