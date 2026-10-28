import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Start with no rows.' },
    { id: 'place', label: 'Place value', description: 'Put this value in the row given by its occurrence number.' },
    { id: 'open', label: 'Open row', description: 'This occurrence needs a row that does not exist yet.' },
    { id: 'done', label: 'Complete', description: 'Report the rows.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Integers 1 to 8 as a JSON array',
  url: 'https://leetcode.com/problems/convert-an-array-into-a-2d-array-with-conditions/',
  complexity: 'O(n) time and O(n) space.',
  examples: [
    { label: 'Example 1', input: '[1,3,4,1,2,3,1]' },
    { label: 'Example 2', input: '[1,2,3,4]' },
  ],
}

export default function DistinctRows() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.length} valueAt={i => run.input[i]} active={step.index ?? -1} roleAt={i => (i < (step.index ?? -1) ? 'placed' : '')} />
    <ol aria-label="Rows" className="algorithm-rows">
      {step.rows.map((row, r) => <li key={r} aria-current={r === step.row ? 'step' : undefined}>
        <strong>Row {r}:</strong> {row.length ? row.join(', ') : '(empty)'}
      </li>)}
    </ol>
  </>} renderReasoning={() => <>
    <p>Two copies of the same value cannot share a row, so the k-th copy of a value must go to row k.</p>
    <p>Each row then holds each value at most once, and the number of rows equals the largest number of copies.</p>
  </>} />
}
