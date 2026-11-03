import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DigitStripView from './DigitStripView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3931',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'A string of 2 to 100 decimal digits',
  url: 'https://leetcode.com/problems/check-adjacent-digit-differences/',
  complexity: 'O(n) time and O(n) space for n digits. The visualization accepts the full 100-digit range.',
  examples: [
    { label: 'Gap too large', input: '3142' },
    { label: 'All close', input: '5753' },
  ],
}

export default function Problem3931Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <DigitStripView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
