import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Side tables', description: 'Find the best window to each side.' },
    { id: 'middle', label: 'Middle window', description: 'Combine the best left window, this middle window, and the best right window.' },
    { id: 'done', label: 'Complete', description: 'Return the lexicographically smallest best triple of starts.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Input (JSON object with nums and k)',
  url: 'https://leetcode.com/problems/maximum-sum-of-3-non-overlapping-subarrays/',
  complexity: 'O(n) time after prefix sums, and O(n) space for the side tables.',
  examples: [
    { label: 'Classic', input: '{"nums":[1,2,1,2,6,7,5,1],"k":2}' },
    { label: 'Ties', input: '{"nums":[1,2,1,2,1,2,1,2,1],"k":2}' },
  ],
}

export default function MaxSumThreeSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const windows = step.starts ?? step.best ?? []
    const role = i => {
      const inWindow = windows.some(s => i >= s && i < s + run.input.k)
      return inWindow ? 'in-window' : ''
    }
    return <>
      <IndexedSequence label={`Values (windows of ${run.input.k})`} length={run.input.nums.length} active={step.j ?? -1} valueAt={i => run.input.nums[i]} roleAt={role} />
      <output aria-label="Triple">{step.total !== null && step.total !== undefined ? `Total ${step.total}` : 'Scanning'}{step.best ? ` · best starts [${step.best.join(', ')}]` : ''}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Ties:</strong> the left and right tables prefer the earliest and the latest windows respectively, so the reported triple is the lexicographically smallest optimal one.</p>
  </>} />
}
