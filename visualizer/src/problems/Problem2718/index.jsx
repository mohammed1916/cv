import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the total to zero.' },
    { id: 'row', label: 'Row query', description: 'Count its free cells.' },
    { id: 'column', label: 'Column query', description: 'Count its free cells.' },
    { id: 'skip', label: 'Overwritten', description: 'A later query already set this line.' },
    { id: 'done', label: 'Complete', description: 'Return the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with "n", "m" and "queries" ([type, index, value] rows), JSON',
  url: 'https://leetcode.com/problems/sum-of-matrix-after-queries/',
  complexity: 'O(q) time for q queries with hash sets. The visualization caps the grid at 6 by 6 and 10 queries.',
  examples: [
    { label: 'Example 1', input: '{"n":3,"m":3,"queries":[[0,0,1],[1,2,2],[0,2,3],[1,0,4]]}' },
    { label: 'Small', input: '{"n":2,"m":2,"queries":[[0,0,5],[1,1,1]]}' },
  ],
}

export default function SumOfMatrixAfterQueries() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label='Queries (oldest first)' length={run.items.length} valueAt={i => String(run.items[i])} active={step.active} roleAt={i => step.roles?.[i] ?? ''} />
    <output aria-label="State">{Object.entries(step.state ?? {}).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`).join(' · ')}</output>
  </>} renderReasoning={() => <>
    <p>A cell is set by its last write, so working backwards means the first query seen for a row or column is the one that survives.</p>
    <p>A surviving row query fills only the columns that no later column query has already set.</p>
  </>} />
}
