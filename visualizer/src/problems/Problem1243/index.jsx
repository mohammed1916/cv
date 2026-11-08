import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RoundTableView from './RoundTableView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1243',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers (e.g. [6,2,3,4,1])',
  url: 'https://leetcode.com/problems/array-transformation/description/',
  complexity: 'O(rounds * n) time and O(rounds * n) space for the stored table. The visualization caps the array at 12 values with values from -100 to 100; the draft does not state an exact official bound or round count.',
  examples: [
    { label: 'Settles fast', input: '[6,2,3,4,1]' },
    { label: 'Several rounds', input: '[1,6,3,4,3,5]' },
    { label: 'Already stable', input: '[1,2,3,4,5]' },
    { label: 'Single value', input: '[7]' },
    { label: 'Equal values', input: '[5,5,5]' },
    { label: 'Extreme values at both limits', input: '[-100,100,-100,100]' },
    { label: 'Long run: twelve values', input: '[44,-96,83,36,61,-95,-76,-16,68,99,56,92]' },
  ],
}

export default function Problem1243ArrayTransformation() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <RoundTableView run={run} step={step} />}
      renderReasoning={() => (
        <p>Every round is built from the previous row only, so the table shows each change as a row. The run stops at the first row that matches the one before it.</p>
      )}
    />
  )
}
