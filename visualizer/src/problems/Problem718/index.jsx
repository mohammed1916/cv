import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty runs', description: 'No matched elements yet.' },
    { id: 'match', label: 'Match', description: 'Extend the diagonal run.' },
    { id: 'mismatch', label: 'Mismatch', description: 'Reset the run to zero.' },
    { id: 'done', label: 'Complete', description: 'Report the longest run.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Arrays (JSON object with nums1 and nums2)',
  url: 'https://leetcode.com/problems/maximum-length-of-repeated-subarray/',
  complexity: 'O(n · m) time and O(n · m) space for the table; a rolling row would use O(m) space.',
  examples: [
    { label: 'Run of three', input: '{"nums1":[1,2,3,2,1],"nums2":[3,2,1,4,7]}' },
    { label: 'Zero', input: '{"nums1":[0,0,0,0,0],"nums2":[0,0,0,0,0]}' },
  ],
}

export default function RepeatedSubarray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DPTable title="Run length ending at (i, j)" values={step.table}
      rowLabels={['', ...run.input.nums1]} columnLabels={['', ...run.input.nums2]} activeCell={{ row: step.row, column: step.column }} />
    <output aria-label="Best run">Best run so far: {step.best}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Diagonal rule:</strong> a common subarray ending at (i, j) extends the one ending at (i−1, j−1) by one exactly when the two values match.</p>
  </>} />
}
