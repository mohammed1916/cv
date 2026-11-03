import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1570',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with vectors a and b (JSON)',
  url: 'https://leetcode.com/problems/dot-product-of-two-sparse-vectors/',
  complexity: 'O(n) time and O(k) space, where k is the number of nonzero entries stored from a.',
  examples: [
    { label: 'Sparse overlap', input: '{"a":[0,4,0,-2,1],"b":[3,0,1,2,0]}' },
    { label: 'No overlap', input: '{"a":[5,0,0],"b":[0,0,2]}' },
    { label: 'Dense-ish', input: '{"a":[2,0,5],"b":[1,0,2]}' },
  ],
}

const cell = (active, tone) => ({
  minWidth: 44, boxSizing: 'border-box', padding: '6px 8px', textAlign: 'center', fontFamily: 'monospace',
  background: tone ?? 'transparent', color: tone ? '#1c1917' : 'inherit',
  border: `${active ? 2 : 1}px solid ${active ? 'var(--text)' : 'var(--border)'}`,
})

export default function SparseDotProduct() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { index, store, total } = step.snapshot
    const stored = new Set(store.map(entry => entry.index))
    const row = (label, values, pick) => <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
      <strong style={{ minWidth: 24 }}>{label}</strong>
      {values.map((v, i) => <div key={i} style={cell(i === index, pick(i) ? '#bbf7d0' : undefined)}>{v}<small> {i}</small></div>)}
    </div>
    return <>
      {row('a', run.input.a, i => stored.has(i))}
      {row('b', run.input.b, i => stored.has(i) && run.input.b[i] !== 0)}
      <p>Stored from a (index: value): <code>{store.length ? store.map(e => `${e.index}: ${e.value}`).join(', ') : 'none yet'}</code></p>
      <p>Running total: <strong>{total}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Store only what matters:</strong> a zero in a never contributes, so the table keeps only the nonzero entries of a.</p>
    <p><strong>Walk b once:</strong> each nonzero b entry is looked up in the table; a hit adds one product.</p>
  </>} />
}
