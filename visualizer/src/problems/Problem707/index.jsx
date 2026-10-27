import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import ListPointerView from '../../components/shared/ListPointerView'
import OperationLog from '../../components/shared/OperationLog'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty list', description: 'No nodes yet.' },
    { id: 'walk', label: 'Walk prev', description: 'Advance prev from the dummy node to the position before the target.' },
    { id: 'splice', label: 'Splice', description: 'Insert or delete at the target position.' },
    { id: 'get', label: 'get', description: 'Walk to the index and read its value.' },
    { id: 'done', label: 'Complete', description: 'All operations complete.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Operations (JSON array)',
  url: 'https://leetcode.com/problems/design-linked-list/',
  complexity: 'O(index) per operation, which is O(n) in the worst case, and O(1) extra space.',
  examples: [
    { label: 'Mixed', input: '[["addAtHead",1],["addAtTail",3],["addAtIndex",1,2],["get",1],["deleteAtIndex",0],["get",0]]' },
  ],
}

export default function LinkedListDesign() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <ListPointerView {...step.view} />
    <OperationLog title="Operations" ops={step.log ?? []} current={step.op ?? -1} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Index rule:</strong> an index equal to the length is a valid append, while larger indices are ignored.</p>
  </>} />
}
