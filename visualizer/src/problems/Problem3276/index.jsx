import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Only the empty set of rows has a score of zero.' },
    { id: 'value', label: 'Value', description: 'Consider taking this value from one of the rows that contain it.' },
    { id: 'done', label: 'Complete', description: 'Report the best score over all sets of rows.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a grid of positive integers (JSON)',
  url: 'https://leetcode.com/problems/select-cells-in-grid-with-maximum-score/',
  complexity: 'O(V * 2^R * R) time for V distinct values and R rows. The visualization caps the grid at 4 by 4 with values up to 20.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[1,2,3],[4,3,2],[1,1,1]]}' },
    { label: 'One row', input: '{"grid":[[8,7,6]]}' },
  ],
}

const show = v => (Number.isFinite(v) ? v : '-')

export default function MaxScore() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Best score for each set of rows (bit r = row r used)" length={step.best.length}
      valueAt={i => show(step.best[i])} active={-1} roleAt={i => (i ? '' : 'empty set')} />
    <output aria-label="Value">{`Current value: ${step.value ?? '-'}; best overall: ${show(step.total)}`}</output>
  </>} renderReasoning={() => <>
    <p>Each selected cell uses a row and a value, and no value may repeat, so processing values one at a time keeps each value to at most one cell.</p>
    <p>A bitmask records which rows are already used, which is the only state a later value needs.</p>
  </>} />
}
