import { getExamples } from "../../config/examplesRegistry";
import AlgorithmStoryWorkspace from "../../components/shared/AlgorithmStoryWorkspace";
import MinCutStory from "./MinCutStory";
import { CODE, buildMinCutStory } from "./algorithm";
import "./PalindromePartitioningIIVisualizer.css";

const EXAMPLES = getExamples("palindrome-partitioning-ii");

const LINE_PATTERN_MAP = {
  1: "init",
  2: "init",
  3: "init",
  4: "loop",
  5: "loop",
  6: "loop",
  7: "check",
  8: "dp",
  9: "loop",
  10: "loop",
  11: "loop",
  12: "check",
  13: "dp",
  14: "loop",
  15: "done",
};

const PATTERNS = ["init", "loop", "check", "dp", "done"];

const definition = {
  title: "Palindrome Partitioning II",
  inputLabel: "Input string s",
  inputType: "string",
  initialInput: "aab",
  examples: EXAMPLES,
  code: CODE.map((text, i) => ({ line: i + 1, text })),
  linePatterns: LINE_PATTERN_MAP,
  patterns: PATTERNS,
  build: (input) => buildMinCutStory(input),
  renderStory: ({ story, step }) => <MinCutStory story={story} step={step} />,
};

export default function PalindromePartitioningIIVisualizer() {
  return <AlgorithmStoryWorkspace definition={definition} />;
}
