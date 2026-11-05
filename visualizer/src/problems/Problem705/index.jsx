import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import OperationLog from '../../components/shared/OperationLog'
import HashSetBucketsView from './HashSetBucketsView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Buckets', description: 'Ten empty buckets.' },
    { id: 'add', label: 'add', description: 'Insert the key into its bucket if absent.' },
    { id: 'remove', label: 'remove', description: 'Delete the key from its bucket.' },
    { id: 'contains', label: 'contains', description: 'Search one bucket.' },
    { id: 'done', label: 'Complete', description: 'All operations complete.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Operations (JSON array of [name, key])',
  url: 'https://leetcode.com/problems/design-hashset/',
  complexity: 'O(1) expected per operation with a good hash and a bounded bucket chain.',
  examples: [
    { label: 'Collide in bucket 4', input: '[["add",4],["add",14],["contains",4],["remove",4],["contains",4],["add",24],["contains",24]]' },
  ],
}

export default function HashSet() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <HashSetBucketsView step={step} />
    <OperationLog title="Operations" ops={step.log ?? []} current={step.op ?? -1} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Chaining:</strong> keys that share a bucket sit in the same list, so an operation only scans that one list.</p>
  </>} />
}
