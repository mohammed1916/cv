import AlgorithmStoryWorkspace from '../../components/shared/AlgorithmStoryWorkspace';
import SumNumbersStory from './SumNumbersStory';
import { CODE, buildSumNumbersStory } from './algorithm';
import './SumRootToLeafNumbersVisualizer.css';

const EXAMPLES = [
  { label: 'Example 1: [1, 2, 3]', input: '[1, 2, 3]' },
  { label: 'Example 2: [4, 9, 0, 5, 1]', input: '[4, 9, 0, 5, 1]' },
  { label: 'Single Node: [5]', input: '[5]' },
  { label: 'Single Zero: [0]', input: '[0]' },
  { label: 'Sparse Tree: [1, null, 3]', input: '[1, null, 3]' },
  { label: 'Full Tree: [1, 2, 3, 4, 5, 6, 7]', input: '[1, 2, 3, 4, 5, 6, 7]' },
];

const LINE_PATTERN_MAP = {
  1: 'init',
  2: 'init',
  3: 'null',
  4: 'compute',
  5: 'leaf',
  6: 'leaf',
  7: 'recurse',
  8: 'done',
};

const PATTERNS = ['init', 'compute', 'leaf', 'recurse', 'null', 'done'];

const definition = {
  title: 'Sum Root to Leaf Numbers',
  inputLabel: 'Binary tree (level-order array)',
  inputType: 'string',
  initialInput: '[1, 2, 3]',
  examples: EXAMPLES,
  code: CODE.map((text, i) => ({ line: i + 1, text })),
  linePatterns: LINE_PATTERN_MAP,
  patterns: PATTERNS,
  build: (input) => buildSumNumbersStory(input),
  renderStory: ({ story, step, stepIndex }) => (
    <SumNumbersStory story={story} step={step} stepIndex={stepIndex} />
  ),
};

export default function SumRootToLeafNumbersVisualizer() {
  return <AlgorithmStoryWorkspace definition={definition} />;
}
