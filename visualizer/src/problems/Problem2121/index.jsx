import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2121',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Integer array as JSON (e.g. [2,5,2,4,5])',
  url: 'https://leetcode.com/problems/intervals-between-identical-elements/',
  complexity: 'O(n) time after grouping (hash map), O(n) space.',
  examples: [
    { label: 'Two repeated values', input: '[2,5,2,4,5]' },
    { label: 'All different', input: '[1,2,3]' },
    { label: 'One value repeated', input: '[7,7,7,7]' }, { label: "Single value", input: "[1]" }, { label: "All equal", input: "[4,4,4]" }, { label: "Largest values", input: "[20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1,20,1]" }, { label: "Long run: 30 values", input: "[11,1,8,20,18,2,19,3,20,16,12,5,14,2,14,12,19,18,6,18,12,5,7,9,17,20,10,16,4,6]" },
  ],
}

export default function Problem2121Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="Array (same-value positions marked)" length={run.input.arr.length} valueAt={i => run.input.arr[i]} active={step.current ?? -1} roleAt={i => step.marks[i] ?? ''} />
          <IndexedSequence label="Interval sums so far" length={run.input.arr.length} valueAt={i => step.result[i] ?? '·'} active={step.current ?? -1} roleAt={() => ''} />
          <RecordStateTable label="Groups by value" columns={['value', 'positions']} rows={step.groups.map(g => ({ value: g.value, positions: g.positions.join(', ') }))} />
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
