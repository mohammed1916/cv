import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import OperationLog from '../../components/shared/OperationLog'
import { StackLane } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Buckets', description: 'Ten empty buckets.' },
    { id: 'put', label: 'put', description: 'Update the pair in place or append it.' },
    { id: 'remove', label: 'remove', description: 'Remove the pair from its bucket.' },
    { id: 'get', label: 'get', description: 'Scan one bucket for the key.' },
    { id: 'done', label: 'Complete', description: 'All operations complete.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Operations (JSON array)',
  url: 'https://leetcode.com/problems/design-hashmap/',
  complexity: 'O(1) expected per operation with a good hash and bounded chains.',
  examples: [
    { label: 'Put, get, remove', input: '[["put",1,1],["put",2,2],["get",1],["get",3],["put",2,1],["get",2],["remove",2],["get",2]]' },
  ],
}

export default function HashMap() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <div aria-label="Buckets" style={{ display: 'grid', gap: 6 }}>
      {step.buckets.map((b, i) => <StackLane key={i} title={`Bucket ${i}`} items={b} note={step.bucket === i ? 'current' : ''} />)}
    </div>
    <OperationLog title="Operations" ops={step.log ?? []} current={step.op ?? -1} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Update in place:</strong> a second put on the same key overwrites the stored value rather than adding a pair.</p>
  </>} />
}
