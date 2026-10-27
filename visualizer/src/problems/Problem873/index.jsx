import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Init', description: 'Set up the value-to-index map and the dp table of 2s.' },
    { id: 'lookup', label: 'Lookup', description: 'Find the required previous element of the chain.' },
    { id: 'extend', label: 'Extend', description: 'Extend a shorter chain by one element.' },
    { id: 'skip', label: 'Skip', description: 'No usable predecessor for this pair.' },
    { id: 'done', label: 'Complete', description: 'Return the best length, or 0.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array arr (JSON, strictly increasing)',
  url: 'https://leetcode.com/problems/length-of-longest-fibonacci-subsequence/',
  complexity: 'O(n^2) time and space. The visualization caps n at 16.',
  examples: [
    { label: 'Example 1', input: '[1,2,3,4,5,6,7,8]' },
    { label: 'Example 2', input: '[1,3,7,11,12,14,18]' },
    { label: 'No chain', input: '[1,4,9,16]' },
  ],
}

export default function LongestFibSubseq() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="arr" length={run.input.length} active={step.k} valueAt={i => run.input[i]} roleAt={i => (i === step.j ? 'left' : i === step.i ? 'right' : '')} />
    <DPTable title="dp[j][k] (rows j, columns k)" values={step.dp} activeCell={step.k >= 0 ? { row: step.j, column: step.k } : null}
      relatedCells={step.i >= 0 && step.i < step.j ? [{ row: step.i, column: step.j }] : []} rowLabels={run.input} columnLabels={run.input} />
    <output aria-label="Best length">Best so far: {step.best >= 3 ? step.best : 0}</output>
  </>} renderReasoning={() => <>
    <p>If a chain ends with a, b, the element before them is forced to be b - a. Since arr is strictly increasing, it must lie at an index before a's index; then the chain length is that pair's length plus one.</p>
    <p>Pairs start at length 2 but only chains of length 3 or more count, so best is reported as 0 if none appears.</p>
  </>} />
}
