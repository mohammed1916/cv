import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Slices (JSON object with slices)',
  url: 'https://leetcode.com/problems/pizza-with-3n-slices/',
  complexity: 'O(n²) time and O(n) space for n = length / 3 chosen slices, using two line passes. The visualization accepts up to 30 slices.',
  examples: [
    { label: 'Six slices', input: '{"slices":[5,1,9,2,7,4]}' },
    { label: 'Three', input: '{"slices":[1,2,3]}' },
    { label: 'Nine', input: '{"slices":[9,8,7,6,5,4,3,2,1]}' },
  ],
}

export default function PizzaWith3nSlices() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const pass = step.snapshot.pass
    const dropped = pass === 'Without the last slice' ? run.input.slices.length - 1 : pass === 'Without the first slice' ? 0 : -1
    return <>
      <IndexedSequence label={`Slices (choose ${run.input.slices.length / 3})`} length={run.input.slices.length}
        valueAt={i => run.input.slices[i]} active={step.snapshot.index === null ? -1 : step.snapshot.index + (pass === 'Without the first slice' ? 1 : 0)}
        roleAt={i => (i === dropped ? 'left out' : '')} />
      {step.snapshot.row && <p>{pass}: best totals by number chosen: {step.snapshot.row.map(v => (v === -Infinity ? '—' : v)).join(', ')}</p>}
      {step.snapshot.best !== null && <p>Answer: {step.snapshot.best}</p>}
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Because the slices form a circle, one of the first or last slice is skipped in some optimum. Each remaining line is solved with the no-neighbours table.</p>
  </>} />
}
