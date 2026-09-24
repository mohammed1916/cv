import { getExamples } from "../../config/examplesRegistry";
import AlgorithmStoryWorkspace from '../../components/shared/AlgorithmStoryWorkspace';
import SumNumbersStory from './SumNumbersStory';
import { CODE, buildSumNumbersStory } from './algorithm';
import './SumRootToLeafNumbersVisualizer.css';

const EXAMPLES = getExamples("sum-root-to-leaf-numbers");

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
