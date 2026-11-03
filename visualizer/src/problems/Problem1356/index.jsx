import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, phases, code, python } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Values (JSON array of integers)',
  complexity: 'O(n log n) time for the sort and O(n log 10) time to count bits, with O(n) extra space.',
  examples: [
    { label: 'Sample', input: '[0,1,2,3,4,5,6,7,8]' },
    { label: 'Powers', input: '[512,256,1,2,768]' },
    { label: 'Small', input: '[15,7,3]' },
  ],
}

export default function SortByOneBits() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => {
      const { values, counted, ordered } = step.snapshot
      const focusIndex = values.indexOf(step.snapshot.focus)
      return <>
        <IndexedSequence label="Input values" length={values.length} valueAt={i => values[i]} active={focusIndex}
          roleAt={i => (counted.some(([v]) => v === values[i]) ? 'counted' : '')} />
        <p><strong>Bit counts:</strong> {counted.map(([v, k]) => `${v}→${k}`).join(', ') || 'not counted yet'}</p>
        {ordered && <p><strong>Sorted:</strong> {ordered.join(', ')}</p>}
      </>
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>} />
}
