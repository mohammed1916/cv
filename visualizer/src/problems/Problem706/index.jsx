import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import OperationLog from '../../components/shared/OperationLog'
import HashMapBucketsView from './HashMapBucketsView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Buckets', description: 'Ten empty buckets.' },
    { id: 'put', label: 'put', description: 'Update the pair in place or append it.' },
    { id: 'remove', label: 'remove', description: 'Remove the pair from its bucket.' },
    { id: 'get', label: 'get', description: 'Scan one bucket for the key.' },
    { id: 'done', label: 'Complete', description: 'All operations complete.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Operations (JSON array)',
  url: 'https://leetcode.com/problems/design-hashmap/',
  complexity: 'O(1) expected per operation with a good hash and bounded chains.',
  examples: [
    { label: 'Overwrite then remove', input: '[["put",3,7],["put",13,8],["get",3],["get",4],["put",13,9],["get",13],["remove",3],["get",3]]' },
  ],
}

export default function HashMap() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <HashMapBucketsView step={step} />
    <OperationLog title="Operations" ops={step.log ?? []} current={step.op ?? -1} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Update in place:</strong> a second put on the same key overwrites the stored value rather than adding a pair.</p>
  </>} />
}
