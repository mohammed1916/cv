import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GridBuildView from './GridBuildView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3990', phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with k from 1 to 1000',
  url: 'https://leetcode.com/problems/create-grid-with-exactly-k-paths-ii/',
  complexity: 'O(log k) construction steps on a fixed grid of at most 25 by 25. A test checks all k from 1 to 1000: the size limit holds and the path count is exact.',
  examples: [
    { label: 'k = 13', input: '{"k":13}' },
    { label: 'One path', input: '{"k":1}' },
    { label: 'Power of two', input: '{"k":64}' },
    { label: 'Many added ones, k = 991', input: '{"k":991}' },
  ],
}

export default function CreateGridWithExactlyKPathsII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <GridBuildView run={run} step={step} />} renderReasoning={() => <>
    <p>Reading k in binary from the left, each digit means double the count, then add the digit. That reaches k in at most nine rounds, and the grid only has to supply those two operations.</p>
    <p>An open 2 by 2 block doubles, since a path can cross it two ways. The first row and first column can each be reached in only one way, so a corridor from either adds exactly 1.</p>
    <p>Each added 1 costs three columns and one row, or the reverse. Choosing the side with more room left keeps both dimensions within 25.</p>
  </>} />
}
