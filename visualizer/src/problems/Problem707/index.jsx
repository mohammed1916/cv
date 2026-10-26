import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import LinkedListLane from '../../components/shared/LinkedListLane'
import OperationLog from '../../components/shared/OperationLog'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty list', description: 'No nodes yet.' },
    { id: 'splice', label: 'Splice', description: 'Insert or delete at the target position.' },
    { id: 'get', label: 'get', description: 'Walk to the index and read its value.' },
    { id: 'done', label: 'Complete', description: 'All operations complete.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Operations (JSON array)',
  url: 'https://leetcode.com/problems/design-linked-list/',
  complexity: 'O(index) per operation, which is O(n) in the worst case, and O(1) extra space.',
  examples: [
    { label: 'Mixed', input: '[["addAtHead",1],["addAtTail",3],["addAtIndex",1,2],["get",1],["deleteAtIndex",0],["get",0]]' },
  ],
}

export default function LinkedListDesign() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <LinkedListLane title="List" nodes={step.list.map((value, id) => ({ id, value }))} />
    <OperationLog title="Operations" ops={step.log ?? []} current={step.op ?? -1} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Index rule:</strong> an index equal to the length is a valid append, while larger indices are ignored.</p>
  </>} />
}
