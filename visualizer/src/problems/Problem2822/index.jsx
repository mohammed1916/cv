import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'The inverted object has no entries yet.' },
    { id: 'assign', label: 'Assign', description: 'A new value maps to its key.' },
    { id: 'make', label: 'List', description: 'A repeated value now lists both keys.' },
    { id: 'append', label: 'Append', description: 'A value that already lists keys takes one more.' },
    { id: 'done', label: 'Result', description: 'Every pair has been inverted.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"pairs": [["a", 1], ["b", 2], ["c", 1]]}',
  url: 'https://leetcode.com/problems/inversion-of-object/',
  complexity: 'O(n) time and O(n) space for n pairs.',
  examples: [
    { label: 'Shared value', input: '{"pairs":[["a","x"],["b","y"],["c","x"]]}' },
    { label: 'Three keys share', input: '{"pairs":[["id",7],["code",7],["tag",9],["size",7]]}' },
    { label: "Single pair", input: "{\"pairs\":[[\"only\",1]]}" },
    { label: "Empty string key", input: "{\"pairs\":[[\"\",0]]}" },
    { label: "Equal string values", input: "{\"pairs\":[[\"a\",\"same\"],[\"b\",\"same\"],[\"c\",\"other\"]]}" },
    { label: "Long run: 12 seeded pairs", input: "{\"pairs\":[[\"k0\",35],[\"k1\",68],[\"k2\",45],[\"k3\",86],[\"k4\",91],[\"k5\",44],[\"k6\",5],[\"k7\",66],[\"k8\",43],[\"k9\",28],[\"k10\",81],[\"k11\",78]]}" },
  ],
}

export default function InversionOfObject() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <RecordStateTable label="Input pairs in order" columns={['position', 'key', 'value', 'status']}
      rows={run.input.pairs.map(([k, v], i) => ({ position: i, key: k, value: String(v), status: step.statuses[i] }))} activeRow={step.at} />
    <output aria-label="Inverted object so far">{`{ ${step.entries.map(([k, v]) => `${k}: ${Array.isArray(v) ? `[${v.join(', ')}]` : v}`).join(', ')} }`}</output>
    <p role="status" style={{ color: 'var(--text)' }}>{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Each value becomes a key in the result, and its key becomes the value. A value that appears twice stores a list of keys in the order they were met.</p>
  </>} />
}
