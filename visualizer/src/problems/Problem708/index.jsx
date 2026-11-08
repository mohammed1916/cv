import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LinkedListLane from '../../components/shared/LinkedListLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'scan', label: 'Walk the cycle', description: 'Compare the pointer pair with the new value.' },
    { id: 'insert', label: 'Insert', description: 'Link the new node after the pivot.' },
    { id: 'done', label: 'Complete', description: 'Read the cycle from the head.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Sorted circular list values (from the head) and insert (JSON)',
  url: 'https://leetcode.com/problems/insert-into-a-sorted-circular-linked-list/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps the list at 15 values.',
  examples: [
    { label: 'Mid gap', input: '{"values":[5,7,2],"insert":6}' },
    { label: 'Empty', input: '{"values":[],"insert":1}' },
    { label: 'Wrap', input: '{"values":[6,8,9],"insert":1}' },
    { label: 'Empty cycle', input: '{"values":[],"insert":4}' },
    { label: 'Equal values', input: '{"values":[2,2,2],"insert":2}' },
    { label: 'Largest values', input: '{"values":[-100,-50,0,50,100],"insert":100}' },
    { label: 'Long run: 15 values', input: '{"values":[-49,-45,-1,2,4,17,19,33,36,55,75,-100,-94,-54,-52],"insert":0}' },
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
