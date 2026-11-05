import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2158',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Days as a JSON array of [start, end) pairs',
  url: 'https://leetcode.com/problems/amount-of-new-area-painted-each-day/',
  complexity: 'Near O(n alpha) time with union-find skip pointers over the painted cells; O(n) space.',
  examples: [
    { label: 'Overlap on day two', input: '[[1,4],[2,6],[0,3]]' },
    { label: 'Disjoint days', input: '[[5,7],[0,2],[9,10]]' },
  ],
}

export default function Problem2158Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label={`Cells 0 to 60 (painted = P; highlighted = today's range ${step.range ? `[${step.range[0]}, ${step.range[1]})` : ''})`} length={61} valueAt={i => (step.cells[i] ? 'P' : '·')} active={step.current ?? -1} roleAt={i => (step.range && i >= step.range[0] && i < step.range[1] ? 'today' : '')} />
          <RecordStateTable label="New area per day" columns={['day', 'new cells']} rows={step.result.map((count, day) => ({ day, 'new cells': count }))} />
          <p>{run.input.plans.length} days in total.</p>
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
