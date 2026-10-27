import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LinkedListLane from '../../components/shared/LinkedListLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Head', description: 'Start at the head of the list.' },
    { id: 'pair', label: 'Neighbours', description: 'Take the gcd of a node and the node after it.' },
    { id: 'insert', label: 'Insert', description: 'Splice the gcd between the two neighbours.' },
    { id: 'done', label: 'Complete', description: 'Return the list with every gcd inserted.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with head (JSON list of positive integers)',
  url: 'https://leetcode.com/problems/insert-greatest-common-divisors-in-linked-list/',
  complexity: 'O(n) time for n nodes, with constant extra pointers. The visualization caps the list at 12 values.',
  examples: [
    { label: 'Example 1', input: '{"head":[18,6,10,3]}' },
    { label: 'Two nodes', input: '{"head":[7,5]}' },
  ],
}

export default function InsertGreatestCommonDivisors() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const roles = Object.fromEntries(step.active.map(id => [id, 'active']))
    return <LinkedListLane title="Linked list" nodes={step.nodes} roles={roles} />
  }} renderReasoning={() => <>
    <p>Each pair of neighbouring nodes gets one new node holding their gcd, so every original node is visited once.</p>
    <p>The new node is spliced in before moving on, so the walk continues from the original next node.</p>
  </>} />
}
