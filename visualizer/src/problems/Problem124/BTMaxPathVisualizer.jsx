import AlgorithmStoryWorkspace from '../../components/shared/AlgorithmStoryWorkspace';
import MaxPathStory from './MaxPathStory';
import { CODE, buildMaxPathStory } from './algorithm';
import './BTMaxPathVisualizer.css';

const EXAMPLES = [
  { label: 'Example 1', input: '[-10, 9, 20, null, null, 15, 7]' },
  { label: 'Example 2 (Simple)', input: '[1, 2, 3]' },
  { label: 'Example 3 (Single Negative)', input: '[-3]' },
  { label: 'Example 4 (All Negative)', input: '[-10, -20, -30, -5, -40]' },
  { label: 'Example 5 (Subtree Dominant)', input: '[-100, 10, 20, 30, 40]' },
  { label: 'Example 6 (Branching)', input: '[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]' },
];

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
