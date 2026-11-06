import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import MaxRangeView from './MaxRangeView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers (e.g. [3, 1, 3, 2])',
  url: 'https://leetcode.com/problems/maximal-range-that-each-element-is-maximum-in-it/',
  complexity: 'O(n) time and O(n) space: two monotonic-stack passes find each boundary once. The visualization caps the array at 12 values.',
  examples: [
    { label: 'Mixed heights', input: '[2, 7, 3, 3, 1]' },
    { label: 'Ties', input: '[4, 4, 4]' },
    { label: 'Single', input: '[9]' },
  ],
}

export default function Problem2832Visualizer() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <MaxRangeView run={run} step={step} />}
    renderReasoning={({ run, step }) => <>
      <p>An index is the maximum of every range that stops just before the nearest strictly greater value on each side. Equal values do not stop the range.</p>
      <p>{run ? `Lengths: ${run.result.join(', ')}.` : ''}</p>
    </>} />
}
