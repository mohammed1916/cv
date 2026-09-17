import AlgorithmStoryWorkspace from "../../components/shared/AlgorithmStoryWorkspace";
import CopyRandomStory from "./CopyRandomStory";
import {
  CODE,
  LINE_PATTERN_MAP,
  PATTERNS,
  buildCopyRandomListStory,
} from "./algorithm";
import { getExamples } from "../../config/examplesRegistry";
import "./CopyListRandomVisualizer.css";

const registryExamples = getExamples("copy-list-random") || [];
const EXAMPLES = [
  ...registryExamples.map((ex) => ({
    label: `${ex.label}: ${JSON.stringify(
      ex.nodes.map((n) => [n.val, n.random])
    )}`,
    input: JSON.stringify(ex.nodes.map((n) => [n.val, n.random])),
  })),
  {
    label: "Single Self-Loop: [[1, 0]]",
    input: "[[1, 0]]",
  },
  {
    label: "Empty List: []",
    input: "[]",
  },
];

const definition = {
  title: "Copy List with Random Pointer",
  inputLabel: "Linked list nodes [[val, random], ...]",
  inputType: "string",
  initialInput: "[[7,null],[13,0],[11,4],[10,2],[1,0]]",
  examples: EXAMPLES,
  code: CODE.map((text, i) => ({ line: i + 1, text })),
  linePatterns: LINE_PATTERN_MAP,
  patterns: PATTERNS,
  build: (input) => buildCopyRandomListStory(input),
  renderStory: ({ story, step, stepIndex }) => (
    <CopyRandomStory story={story} step={step} stepIndex={stepIndex} />
  ),
};

export default function CopyListRandomVisualizer() {
  return <AlgorithmStoryWorkspace definition={definition} />;
}
