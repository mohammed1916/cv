import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SwapTrackView from './SwapTrackView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2340',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Integer array as JSON (e.g. [3,5,2,7,1,4])',
  url: 'https://leetcode.com/problems/minimum-adjacent-swaps-to-make-a-valid-array/',
  complexity: 'O(n^2) time in the worst case because each move shifts one value across up to n positions, and O(n) space for the array copy. The visualization caps the array at 10 values from 1 to 10; the draft does not verify the official bounds.',
  examples: [
    { label: 'Six values', input: '[4,2,6,1,5]' },
    { label: 'Four values', input: '[3,4,1,2]' },
    { label: 'Max before min', input: '[5,1]' },
  ],
}

export default function Problem2340Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <SwapTrackView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
