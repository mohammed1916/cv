import AlgorithmStoryWorkspace from "../../components/shared/AlgorithmStoryWorkspace";
import ConsecutiveStory from "./ConsecutiveStory";
import { CODE, buildConsecutiveStory } from "./algorithm";
import { getExamples } from "../../config/examplesRegistry";
import "./LongestConsecutiveVisualizer.css";

const registryExamples = getExamples("longest-consecutive-sequence") || [];
const EXAMPLES = [
  ...registryExamples.map((ex) => ({
    label: ex.label,
    input: JSON.stringify(ex.nums),
  })),
  {
    label: "Classic [100,4,200,1,3,2]",
    input: "[100, 4, 200, 1, 3, 2]",
  },
  {
    label: "Long chain [0..8]",
    input: "[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]",
  },
  {
    label: "Negative numbers",
    input: "[-2, -3, -1, 10, 11]",
  },
  {
    label: "Duplicates [1,2,0,1]",
    input: "[1, 2, 0, 1]",
  },
  {
    label: "Single element",
    input: "[42]",
  },
  {
    label: "Empty array",
    input: "[]",
  },
];

const definition = {
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
