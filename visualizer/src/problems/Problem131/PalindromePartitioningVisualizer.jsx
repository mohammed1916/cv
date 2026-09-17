import AlgorithmStoryWorkspace from "../../components/shared/AlgorithmStoryWorkspace";
import PartitionStory from "./PartitionStory";
import { CODE, buildPartitionStory } from "./algorithm";
import { getExamples } from "../../config/examplesRegistry";
import "./PalindromePartitioningVisualizer.css";

const registryExamples = getExamples("palindrome-partitioning") || [];
const EXAMPLES = [
  ...registryExamples.map((ex) => ({
    label: ex.label,
    input: ex.s ?? ex.input ?? "aab",
  })),
  { label: "\"abc\" (no multi-char)", input: "abc" },
  { label: "\"racecar\" (full palindrome)", input: "racecar" },
  { label: "\"abba\" (even palindrome)", input: "abba" },
];

const definition = {
  title: "Palindrome Partitioning",
  inputLabel: "Input string s (length 1 to 16)",
  inputType: "string",
  initialInput: "aab",
  examples: EXAMPLES,
  code: CODE.map((text, i) => ({ line: i + 1, text })),
  linePatterns: {
    2: "init",
    4: "inspect",
    5: "complete",
    6: "backtrack",
    7: "inspect",
    8: "inspect",
    9: "validate",
    10: "branch",
    11: "init",
    12: "done",
  },
  patterns: ["init", "inspect", "validate", "branch", "complete", "backtrack", "done"],
  build: (input) => buildPartitionStory(input),
  renderStory: ({ story, step }) => <PartitionStory story={story} step={step} />,
};

export default function PalindromePartitioningVisualizer() {
  return <AlgorithmStoryWorkspace definition={definition} />;
}
