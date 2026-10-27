import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LinkedListLane from '../../components/shared/LinkedListLane'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'scan', label: 'Walk the cycle', description: 'Compare the pointer pair with the new value.' },
    { id: 'insert', label: 'Insert', description: 'Link the new node after the pivot.' },
    { id: 'done', label: 'Complete', description: 'Read the cycle from the head.' },
  ],
  parse: parseInput, build: buildTrace, code,
  inputLabel: 'Sorted circular list values (from the head) and insert (JSON)',
  url: 'https://leetcode.com/problems/insert-into-a-sorted-circular-linked-list/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps the list at 15 values.',
  examples: [
    { label: 'Example 1', input: '{"values":[3,4,1],"insert":2}' },
    { label: 'Empty', input: '{"values":[],"insert":1}' },
    { label: 'Wrap', input: '{"values":[3,4,1],"insert":5}' },
  ],
}

export default function InsertCircularList() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    if (step.prev !== null) roles[step.prev] = 'active'
    if (step.cur !== null) roles[step.cur] = 'visited'
    const pointers = []
    if (step.prev !== null) pointers.push({ label: 'prev', id: step.prev })
    if (step.cur !== null) pointers.push({ label: 'cur', id: step.cur, tone: 'secondary' })
    return <>
      <LinkedListLane title="Circular list" nodes={step.nodes} pointers={pointers} roles={roles} cycleTo={run.head ?? null}
        note={step.fits === undefined ? undefined : step.fits ? 'fits here' : 'keep walking'} />
      <output aria-label="Result">{step.result ? `Cycle from head: ${step.result.join(' → ')}` : `Inserting ${run.input.insert}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each pair of neighbours marks a gap. The value fits a gap when it is between the two values, or when the pair straddles the wrap and the value is at least the largest or at most the smallest.</p>
    <p>Insertion only relinks two pointers, so the head is unchanged and the cycle stays sorted.</p>
  </>} />
}
