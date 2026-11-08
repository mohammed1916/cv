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
    { label: 'Minimum value 1', input: '[1]' },
    { label: 'Equal values', input: '[5,5,5,5,5]' },
    { label: 'Largest values', input: '[100,1,100,1]' },
    { label: 'Long run: 100 nodes', input: '[40,6,62,67,8,11,62,74,28,99,13,6,78,4,71,33,28,22,99,6,52,90,36,69,28,74,81,56,61,85,12,60,10,39,74,59,57,37,4,63,42,88,16,3,64,50,38,95,19,55,1,10,90,47,98,20,85,48,37,7,65,25,43,65,32,42,29,84,22,68,4,5,55,46,36,56,47,99,76,22,31,81,22,7,46,5,13,26,20,74,65,83,72,22,48,32,9,29,59,19]' },
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
