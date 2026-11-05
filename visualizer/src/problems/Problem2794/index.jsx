import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'The object has no keys yet.' },
    { id: 'assign', label: 'Assign', description: 'A new key takes the value at its position.' },
    { id: 'skip', label: 'Skip', description: 'A repeated key keeps its first value.' },
    { id: 'done', label: 'Result', description: 'The object holds every first occurrence.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"keys": ["id", "name", "id"], "values": [7, "Ada", 9]}',
  url: 'https://leetcode.com/problems/create-object-from-two-arrays/',
  complexity: 'O(n) time and O(n) space for n pairs.',
  examples: [
    { label: 'Repeated id', input: '{"keys":["id","name","id"],"values":[7,"Ada",9]}' },
    { label: 'Keys of mixed types', input: '{"keys":[3,"3",true],"values":["x","y","z"]}' },
  ],
}

export default function CreateObjectFromTwoArrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RecordStateTable label="Pairs by position"
      columns={['position', 'key', 'value', 'status']}
      rows={run.input.keys.map((k, i) => ({ position: i, key: JSON.stringify(String(k)), value: JSON.stringify(run.input.values[i]), status: step.statuses[i] }))}
      activeRow={step.at} />
    <output aria-label="Object so far">{`{ ${step.entries.map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(', ')} }`}</output>
    <p role="status" style={{ color: 'var(--text)' }}>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Each position pairs one key with one value. Keys are compared as strings, so 3 and "3" are the same key.</p>
    <p>The first position that uses a key decides its value; later positions with that key are skipped.</p>
  </>} />
}
