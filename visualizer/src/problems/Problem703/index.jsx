import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Initial values', description: 'Keep the k largest of the initial numbers.' },
    { id: 'add', label: 'Add value', description: 'Keep the value only if it beats the smallest kept value.' },
    { id: 'done', label: 'Complete', description: 'Return every answer.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Stream (JSON object with k, nums and adds)',
  url: 'https://leetcode.com/problems/kth-largest-element-in-a-stream/',
  complexity: 'O(k) per add with this sorted list. A min-heap of size k gives O(log k) per add.',
  examples: [
    { label: 'Three largest', input: '{"k":3,"nums":[4,5,8,2],"adds":[3,5,10,9,4]}' },
    { label: 'Single', input: '{"k":1,"nums":[],"adds":[-3,-2,-4,0,4]}' },
  ],
}

export default function KthLargestStream() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <StackLane title={`Top ${run.input.k} kept (smallest first)`} items={step.top.map(String)} note={step.op !== null && step.op !== undefined ? `after add ${run.input.adds[step.op]}` : 'initial'} />
    <output aria-label="Kth largest">Kth largest: {step.top[0] ?? '—'}</output>
  </>} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Why only k:</strong> values below the current kth largest can never become the answer, so discarding them is safe.</p>
    <p>Stream length so far: {run.input.nums.length + (step.op ?? -1) + 1}.</p>
  </>} />
}
