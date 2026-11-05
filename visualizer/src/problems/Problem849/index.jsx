import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Seats', description: 'Scan every seat in order.' },
    { id: 'taken', label: 'Taken', description: 'Taken seats are skipped.' },
    { id: 'empty', label: 'Empty', description: 'Measure the nearest person from this empty seat.' },
    { id: 'done', label: 'Complete', description: 'Return the best distance.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Seats (JSON array of 0 and 1)',
  url: 'https://leetcode.com/problems/maximize-distance-to-closest-person/',
  complexity: 'O(n) time with the left and right scans; this visualization uses an O(n^2) check that is easy to follow.',
  examples: [
    { label: 'Middle gap', input: '[1,0,0,0,1,0,0,0,0]' },
    { label: 'Edge gap', input: '[0,0,1,0,0,0]' },
  ],
}

export default function MaximizeDistance() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Seats (1 = taken, current seat marked)" length={run.input.length} active={step.seat}
      valueAt={i => run.input[i]}
      roleAt={i => (i === step.bestSeat ? 'best' : run.input[i] === 1 ? 'taken' : '')} />
    <output aria-label="Best">{`Best distance: ${step.best}${step.bestSeat >= 0 ? ` at seat ${step.bestSeat}` : ''}`}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>The best seat is the empty one whose nearest person is furthest away. From an empty seat, that is the smaller gap to the seated person on either side.</p>
  </>} />
}
