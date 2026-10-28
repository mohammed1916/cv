import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import OperationLog from '../../components/shared/OperationLog'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Every index holds zero and no snapshot exists yet.' },
    { id: 'set', label: 'Set', description: 'Record the value under the snapshot that will be taken next.' },
    { id: 'snap', label: 'Snapshot', description: 'Return the new snapshot id and move to the next id.' },
    { id: 'get', label: 'Get', description: 'Find the newest entry no later than the requested snapshot.' },
    { id: 'done', label: 'Complete', description: 'Return every value produced by snap and get.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: {"length": n, "ops": [["set", i, v], ["snap"], ["get", i, id]]}',
  url: 'https://leetcode.com/problems/snapshot-array/',
  complexity: 'Each set or snapshot is constant time; each get is a binary search over that index history. The visualization caps input at 6 indices and 16 operations.',
  examples: [
    { label: 'Example 1', input: '{"length":3,"ops":[["set",0,5],["snap"],["set",0,6],["get",0,0]]}' },
    { label: 'Example 2', input: '{"length":2,"ops":[["snap"],["set",1,7],["snap"],["get",1,0],["get",1,1]]}' },
  ],
}

export default function SnapshotArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Current array" length={run.input.length} valueAt={i => step.current[i]} />
    <OperationLog title="Operations" ops={run.log} current={step.op ?? -1} />
  </>} renderReasoning={() => <>
    <p>Each index keeps only the values it had when a change happened, tagged with the snapshot that would first see it.</p>
    <p>A get looks for the newest tag no later than the requested snapshot, which a binary search finds without copying the array.</p>
  </>} />
}
