import AlgorithmStoryWorkspace from "../../components/shared/AlgorithmStoryWorkspace";
import MinCutStory from "./MinCutStory";
import { CODE, buildMinCutStory } from "./algorithm";
import "./PalindromePartitioningIIVisualizer.css";

const EXAMPLES = [
  {
    label: 'aab (1 cut: "aa"|"b")',
    input: "aab",
  },
  {
    label: "a (0 cuts)",
    input: "a",
  },
  {
    label: 'ab (1 cut: "a"|"b")',
    input: "ab",
  },
  {
    label: "racecar (0 cuts)",
    input: "racecar",
  },
  {
    label: "abacaba (0 cuts)",
    input: "abacaba",
  },
  {
    label: 'aabb (1 cut: "aa"|"bb")',
    input: "aabb",
  },
  {
    label: 'aaabbc (2 cuts: "aaa"|"bb"|"c")',
    input: "aaabbc",
  },
  {
    label: "abcde (4 cuts)",
    input: "abcde",
  },
];

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
