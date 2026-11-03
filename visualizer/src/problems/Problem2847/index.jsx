import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DigitPeelView from './DigitPeelView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Positive integer n (e.g. 360)',
  url: 'https://leetcode.com/problems/smallest-number-with-given-digit-product/',
  complexity: 'O(log n) time and O(log n) space: each division removes at least one factor of 2, and the digits are at most about log2(n) long. The visualization caps n at 100000; the official bounds are not verified here. The -1 sentinel is an assumption.',
  examples: [
    { label: 'Mixed factors', input: '360' },
    { label: 'Prime seven', input: '7' },
    { label: 'Impossible', input: '11' },
  ],
}

export default function Problem2847Visualizer() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <DigitPeelView run={run} step={step} />}
    renderReasoning={({ run, step }) => <>
      <p>Using the largest digits first makes the fewest digits possible, and sorting those digits ascending gives the smallest number with that many digits.</p>
      <p>{run ? `Result: ${run.result}.` : ''}</p>
    </>} />
}
