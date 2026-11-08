import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SumScoreView from './SumScoreView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2219',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Integer array as JSON (e.g. [4,3,-2,5])',
  url: 'https://leetcode.com/problems/maximum-sum-score-of-array/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps the array at 12 values with magnitude up to 100.',
  examples: [
    { label: 'Mixed signs', input: '[2,-5,4,1]' },
    { label: 'Two values', input: '[6,-6]' },
    { label: 'All negative', input: '[-3,-1,-2]' },
    { label: 'Single zero', input: '[0]' },
    { label: 'Extreme values', input: '[100,-100,100,-100,100,-100,100,-100,100,-100,100,-100]' },
    { label: 'Long run: 12 values', input: '[17,-42,8,-3,25,-61,4,-19,33,-7,50,-28]' },
  ],
}

export default function Problem2219Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SumScoreView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
