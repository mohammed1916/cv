import authoredExamples0 from '../../config/examples/local--131.js';

import { partitionNarrative } from './partitionNarrative.js';
import AlgorithmStoryWorkspace from "../../components/shared/AlgorithmStoryWorkspace";
import PartitionStory from "./PartitionStory";
import { CODE, buildPartitionStory } from "./algorithm";

import "./PalindromePartitioningVisualizer.css";

const EXAMPLES = authoredExamples0;

const definition = {
  narrative: partitionNarrative,
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
