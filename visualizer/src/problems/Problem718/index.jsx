import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import MatrixGrid from '../../components/shared/MatrixGrid'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty border', description: 'Row 0 and column 0 hold no run.' },
    { id: 'match', label: 'Match', description: 'Equal values extend the run on the diagonal.' },
    { id: 'break', label: 'Mismatch', description: 'A mismatch resets the run to 0.' },
    { id: 'done', label: 'Complete', description: 'The longest run anywhere in the table is the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'nums1 and nums2 (JSON object)',
  url: 'https://leetcode.com/problems/maximum-length-of-repeated-subarray/',
  complexity: 'O(m * n) time and O(m * n) space for the table.',
  examples: [
    { label: 'Shared run', input: '{"nums1":[4,5,6,7],"nums2":[5,6,9,4,5,6]}' },
    { label: 'Double', input: '{"nums1":[2,2,8],"nums2":[8,2,2,2]}' },
    { label: 'Single shared value', input: '{"nums1":[7],"nums2":[7]}' },
    { label: 'No shared value', input: '{"nums1":[1,2],"nums2":[3,4]}' },
    { label: 'Repeated values tie', input: '{"nums1":[9,9,9],"nums2":[9,9,9,9]}' },
    { label: 'Long run: 60 values', input: '{"nums1":[2,1,1,0,3,1,3,1,3,3,2,1,0,1,3,0,2,0,3,1,2,2,2,2,1,1,1,1,3,1,0,1,0,3,1,0,2,1,0,3,0,3,1,1,2,2,0,0,0,3,0,2,0,2,0,3,1,3,1,2],"nums2":[2,3,3,3,2,3,0,1,2,3,0,2,1,0,3,1,3,1,2,1,0,0,2,0,3,1,0,2,3,3,0,2,3,3,2,2,2,1,2,0,3,0,1,2,0,1,3,3,1,2,3,1,3,3,0,3,0,2,2,0]}' },
  ],
}

export default function RepeatedSubarray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums1 (rows)" length={run.input.nums1.length} active={step.row - 1}
      valueAt={i => run.input.nums1[i]} roleAt={i => (step.row - 1 === i ? 'row' : '')} />
    <IndexedSequence label="nums2 (columns)" length={run.input.nums2.length} active={step.column - 1}
      valueAt={i => run.input.nums2[i]} roleAt={i => (step.column - 1 === i ? 'column' : '')} />
    <MatrixGrid label="Run length ending at each pair" matrix={step.table}
      activeCell={step.row ? { row: step.row, col: step.column } : null}
      highlightedCells={step.sources.map(([row, col]) => ({ row, col }))}
      foundCell={step.bestEnd ? { row: step.bestEnd[0], col: step.bestEnd[1] } : null} />
    <output aria-label="Best run">{`Best run so far: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>Each cell holds the length of the common run that ends at that pair of positions. A run continues only from the diagonal cell, when the two values match.</p>
    <p>A mismatch resets the run to zero, so the answer is the largest value anywhere in the table, not the bottom-right cell.</p>
  </>} />
}
