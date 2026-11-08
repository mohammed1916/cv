import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PairDeletionTableView from './PairDeletionTableView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3496',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Array of integers, for example [4,-1,7,2,3]',
  url: 'https://leetcode.com/problems/maximize-score-after-pair-deletions/',
  complexity: 'O(n^2) time and O(n^2) space for n values: each window is scored once from its three smaller windows. The visualization caps the array at 10 values.',
  examples: [
    { label: 'Mixed signs', input: '[4,-1,7,2,3]' },
    { label: 'Ends pay best', input: '[-5,8,-2,9,1,-3]' },
    { label: 'Short array', input: '[6,1]' },
    { label: 'Single value', input: '[0]' },
    { label: 'Equal values', input: '[4,4,4]' },
    { label: 'Extremes', input: '[-9,9,-9,9,-9,9,-9,9,-9,9]' },
    { label: 'Descending run', input: '[9,8,7,6,5,4,3,2,1,0]' },
    { label: 'Long run: 10 values', input: '[-8,-2,-7,0,7,6,8,8,0,-2]' },
  ],
}

export default function MaximizeScoreAfterPairDeletionsVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <PairDeletionTableView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
