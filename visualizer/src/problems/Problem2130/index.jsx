import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2130',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Node values in order as a JSON array (even length)',
  url: 'https://leetcode.com/problems/maximum-twin-sum-of-a-linked-list/',
  complexity: 'O(n) time and O(1) extra space with two pointers on the list.',
  examples: [
    { label: 'Four nodes', input: '[9,1,7,3]' },
    { label: 'Six nodes', input: '[4,2,2,3,7,1]' },
  ],
}

export default function Problem2130Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="Linked list nodes (l from the head, r from the tail)" length={run.input.values.length} valueAt={i => run.input.values[i]} active={step.l >= 0 ? step.l : -1} roleAt={i => (i === step.l ? 'l' : i === step.r ? 'r' : '')} />
          <RecordStateTable label="Twin pairs" columns={['left', 'right', 'sum']} rows={step.pairs} />
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
