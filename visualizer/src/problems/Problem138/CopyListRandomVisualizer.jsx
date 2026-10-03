import { getExamples as getAuthoredExamples } from '../../config/examplesRegistry';
import { copyRandomNarrative } from './copyRandomNarrative.js';
import AlgorithmStoryWorkspace from "../../components/shared/AlgorithmStoryWorkspace";
import CopyRandomStory from "./CopyRandomStory";
import {
  CODE,
  LINE_PATTERN_MAP,
  PATTERNS,
  buildCopyRandomListStory,
} from "./algorithm";

import "./CopyListRandomVisualizer.css";

const EXAMPLES = getAuthoredExamples('local:138');

const definition = {
  narrative: copyRandomNarrative,
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
