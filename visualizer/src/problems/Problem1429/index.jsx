import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  number: '1429',
  phases: [
    { id: 'start', label: 'Empty', description: 'No values have been added.' },
    { id: 'add', label: 'Add', description: 'Count the value and remember its first sighting.' },
    { id: 'first', label: 'Query', description: 'Scan remembered values for the first with count one.' },
    { id: 'done', label: 'Result', description: 'Report every answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with ops: ["add", value] or ["first"]',
  url: 'https://leetcode.com/problems/first-unique-number/',
  complexity: 'O(1) per add and O(k) per query, where k is the number of distinct values seen. The visualization caps the input at 20 operations.',
  examples: [
    { label: 'Example', input: '{"ops":[["add",7],["first"],["add",4],["first"],["add",7],["first"],["add",9],["first"]]}' },
    { label: 'One add, one query', input: '{"ops":[["add",1],["first"]]}' },
    { label: 'Equal values added twice', input: '{"ops":[["add",5],["add",5],["first"]]}' },
    { label: 'Largest value allowed', input: '{"ops":[["add",20],["add",1],["first"],["add",20],["first"]]}' },
    { label: 'Long run: 20 operations', input: '{"ops":[["add",19],["add",9],["first"],["first"],["first"],["add",18],["first"],["first"],["first"],["first"],["first"],["first"],["first"],["first"],["first"],["add",14],["first"],["add",14],["first"],["add",19]]}' },
  ],
}

import FrequencyCountTable from '../../components/shared/FrequencyCountTable'

const chip = { minWidth: 40, padding: '4px 8px', textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', background: 'var(--surface2)' }

export default function FirstUniqueNumber() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const state = step.state || []
    const entries = state.map(line => {
      const match = /^(-?\d+) seen (\d+)x$/.exec(line)
      return match ? [Number(match[1]), Number(match[2])] : null
    }).filter(Boolean)
    const firstUnique = entries.find(([, c]) => c === 1)?.[0] ?? null
    return <>
      <div role="list" aria-label="Remembered values in arrival order" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {entries.length ? entries.map(([v, c]) => <span key={v} role="listitem" style={{ ...chip, borderWidth: v === firstUnique ? 2 : 1, borderColor: v === firstUnique ? 'var(--primary)' : 'var(--border)', fontWeight: c === 1 ? 700 : 400 }}>
          {v}<br /><small>{c === 1 ? 'unique' : `seen ${c}x`}</small>
        </span>) : <em style={{ color: 'var(--text)' }}>Nothing added yet.</em>}
      </div>
      <FrequencyCountTable title="Counts (in arrival order)" entries={entries} active={firstUnique} emptyText="No numbers yet." />
      <p style={{ color: 'var(--text)' }}>First unique now: <strong>{firstUnique === null ? '-1' : firstUnique}</strong></p>
      <p style={{ color: 'var(--text)' }}>{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Arrival order:</strong> the first unique number is the earliest value whose count is still one, so the list keeps values in the order they first arrived.</p>
    <p><strong>Counts change:</strong> a repeat turns a value into a non-unique one, and the answer moves to the next value that still has a count of one.</p>
  </>} />
}
