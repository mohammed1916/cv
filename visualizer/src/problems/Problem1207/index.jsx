import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, inputLabel, complexity, examples } from './algorithm'

const definition = {
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, pythonLineMap, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`, complexity, examples,
}

const chip = (active, extra = {}) => ({
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', boxSizing: 'border-box',
  fontFamily: 'monospace', color: 'var(--text)',
  border: active ? '2px solid var(--text)' : '1px solid var(--border)',
  background: active ? 'color-mix(in srgb, var(--primary) 28%, transparent)' : 'var(--surface2)',
  ...extra,
})

export default function UniqueOccurrencesVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { counts, claimed, value, count, clash } = step.snapshot
    const maxCount = Math.max(1, ...counts.map(row => row.count))
    return <>
      <section aria-label="Value to count map" style={{ marginBottom: 12 }}>
        <h3>Map: value → occurrences</h3>
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 6 }}>
          {counts.map(row => {
            const active = row.value === value
            return <li key={row.value} data-value={row.value} style={{ display: 'grid', gridTemplateColumns: '64px 1fr 48px', alignItems: 'center', gap: 8 }}>
              <span style={chip(active)}>{row.value}</span>
              <div aria-hidden="true" style={{ height: 14, border: '1px solid var(--border)', background: 'var(--surface2)' }}>
                <div style={{ width: `${(row.count / maxCount) * 100}%`, height: '100%', background: active ? 'var(--primary)' : 'var(--text-dim)' }} />
              </div>
              <span style={{ color: 'var(--text)', fontFamily: 'monospace' }}>{row.count}×</span>
            </li>
          })}
        </ul>
      </section>
      <section aria-label="Claimed occurrence counts">
        <h3>Set: counts already claimed</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {claimed.length === 0 && <small style={{ color: 'var(--text-dim)' }}>none yet</small>}
          {claimed.map(row => <span key={row.count} data-count={row.count} style={chip(row.count === count, { flexDirection: 'column', alignItems: 'flex-start' })}>
            <strong>{row.count}</strong><small style={{ color: 'var(--text-dim)' }}>claimed by {row.value}</small>
          </span>)}
        </div>
      </section>
      {clash !== undefined && <output aria-label="Clash">{`Count ${count} is already claimed by value ${clash}, so the answer is false.`}</output>}
      {clash === undefined && count !== undefined && <output aria-label="Count being checked">{`Checking count ${count} for value ${value}.`}</output>}
    </>
  }} renderReasoning={() => <p><strong>Two structures:</strong> a map counts each value, then a set records each occurrence count. A second value with a count already in the set is the only way to return false.</p>} />
}
