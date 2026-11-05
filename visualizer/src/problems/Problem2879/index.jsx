import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Table', description: 'Look at the whole table.' },
    { id: 'step', label: 'Take row', description: 'Keep one of the first three rows.' },
    { id: 'done', label: 'Head', description: 'The first rows are returned.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with rows (list of row objects)',
  url: 'https://leetcode.com/problems/display-the-first-three-rows/',
  complexity: 'O(1) for three rows; the cost does not grow with the table.',
  examples: [
    { label: 'Five rows', input: '{"rows":[{"id":1},{"id":2},{"id":3},{"id":4},{"id":5}]}' },
    { label: 'Two rows', input: '{"rows":[{"id":"a"},{"id":"b"}]}' },
  ],
}

export default function DisplayFirstThreeRows() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Table rows (first three kept)" length={Math.max(step.out.length, 1)} valueAt={i => step.out[i] ?? ''} active={step.at}
      roleAt={i => (i < step.out.length ? 'kept' : 'dropped')} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A prefix is the first few items in the order they already have. Nothing is reordered or recomputed.</p>
  </>} />
}
