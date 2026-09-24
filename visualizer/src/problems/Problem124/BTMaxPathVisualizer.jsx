import { getExamples } from "../../config/examplesRegistry";
import AlgorithmStoryWorkspace from '../../components/shared/AlgorithmStoryWorkspace';
import MaxPathStory from './MaxPathStory';
import { CODE, buildMaxPathStory } from './algorithm';
import './BTMaxPathVisualizer.css';

const EXAMPLES = getExamples("binary-tree-maximum-path-sum");

const LINE_PATTERN_MAP = {
  2: 'init',
  5: 'base',
  6: 'recurse',
  7: 'recurse',
  8: 'compute',
  9: 'update',
  10: 'return',
  11: 'init',
  12: 'done',
};

const PATTERNS = ['init', 'recurse', 'compute', 'update', 'return', 'done'];

const definition = {
  title: 'Binary Tree Maximum Path Sum',
  inputLabel: 'Binary tree (level-order array)',
  inputType: 'string',
  initialInput: '[-10, 9, 20, null, null, 15, 7]',
  examples: EXAMPLES,
  code: CODE.map((text, i) => ({ line: i + 1, text })),
  linePatterns: LINE_PATTERN_MAP,
  patterns: PATTERNS,
  build: (input) => buildMaxPathStory(input),
  renderStory: ({ story, step, stepIndex }) => (
    <MaxPathStory story={story} step={step} stepIndex={stepIndex} />
  ),
};

export default function BTMaxPathVisualizer() {
  return <AlgorithmStoryWorkspace definition={definition} />;
}
