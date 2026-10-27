import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LinkedListLane from '../../components/shared/LinkedListLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Lists', description: 'Read list1 and list2.' },
    { id: 'locate', label: 'Locate', description: 'Find the node before index a and the node at index b.' },
    { id: 'splice', label: 'Splice', description: 'Link list2 in and reconnect the tail past the removed nodes.' },
    { id: 'done', label: 'Complete', description: 'Report the merged list.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with list1, a, b and list2',
  url: 'https://leetcode.com/problems/merge-in-between-linked-lists/',
  complexity: 'O(a + (b - a) + length of list2) time with O(1) extra pointers. The visualization caps list1 at 10 nodes.',
  examples: [
    { label: 'Example 1', input: '{"list1":[0,1,2,3,4,5],"a":3,"b":4,"list2":[10,11,12]}' },
    { label: 'Example 2', input: '{"list1":[0,1,2,3,4,5,6],"a":2,"b":5,"list2":[10,11,12,13,14]}' },
  ],
}

export default function MergeLinkedLists() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const roles = {}
    step.removed.forEach(id => { roles[id] = 'removed' })
    return <LinkedListLane title="list1 after splicing" nodes={step.nodes} pointers={step.pointers} roles={roles} note={step.removed.length ? 'shaded nodes are removed' : undefined} />
  }} renderReasoning={() => <>
    <p>The merge touches only two nodes of list1 and the tail of list2. Everything between index a and index b falls away when left points at list2.</p>
    <p>Keeping the node after b in a separate pointer before relinking means the rest of list1 is never lost.</p>
  </>} />
}
