import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ListPointerView from '../../components/shared/ListPointerView'
import LinkedListLane from '../../components/shared/LinkedListLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Place slow and fast on the head.' },
    { id: 'check', label: 'Check fast', description: 'Test whether fast and fast.next exist.' },
    { id: 'advance', label: 'Advance', description: 'Move slow by one node and fast by two.' },
    { id: 'done', label: 'Complete', description: 'Return the slow pointer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Node values head (JSON array)',
  url: 'https://leetcode.com/problems/middle-of-the-linked-list/',
  complexity: 'O(n) time and O(1) extra space: fast reaches the end after about n/2 loop iterations.',
  examples: [
    { label: 'Odd length', input: '[1,2,3,4,5]' },
    { label: 'Even length', input: '[1,2,3,4,5,6]' },
    { label: 'Single node', input: '[7]' },
  ],
}

export default function MiddleOfTheLinkedList() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => {
      const nodes = run.input.map((value, id) => ({ id, value }))
      const pointers = [{ id: step.slow, label: 'slow', tone: 'primary' }]
      if (step.fast < nodes.length) pointers.push({ id: step.fast, label: 'fast', tone: 'secondary' })
      const roles = { [step.slow]: 'active' }
      return <>
        <LinkedListLane title="Linked list" nodes={nodes} pointers={pointers} roles={roles} note={step.fast >= nodes.length ? 'fast = null' : undefined} />
        {step.view && <ListPointerView {...step.view} />}
        <output aria-label="Pointer positions">slow at index {step.slow}; fast at {step.fast < nodes.length ? `index ${step.fast}` : 'null'}</output>
        {step.phase === 'done' && <output aria-label="Returned list">Returned list: [{run.result.join(', ')}]</output>}
      </>
    }}
    renderReasoning={({ run, step }) => <>
      <p>slow = {step.slow}, fast = {step.fast < run.input.length ? step.fast : 'null'}.</p>
      <p><strong>Invariant:</strong> fast has always travelled exactly twice as far as slow.</p>
      <p>When fast falls off the end after about n steps, slow has made about n/2 steps, which is the middle. For an even length, fast becomes null and slow lands on the second of the two middle nodes, as the problem requires.</p>
    </>} />
}
