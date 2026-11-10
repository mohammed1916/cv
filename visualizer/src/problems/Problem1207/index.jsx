import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { useTutorialScene } from '../../components/shared/TutorialScene'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, inputLabel, complexity, examples } from './algorithm'
import { uniqueOccurrencesTutorial } from './tutorial'

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

// Focused view: only the scanned list element, its map entry (or claimed-set entry) and the transfer between them.
// The full list, map and set stay in the non-tutorial view.
function FocusedScene({ run, focus }) {
  const { kind, position, value, count, old, clash, result, counts, claimed } = focus
  const entry = counts.find(row => row.value === value)
  const claim = claimed.find(row => row.count === count)
  const transfer = ['read', 'write'].includes(kind) || kind === 'claim'
  if (kind === 'done') return <output aria-label="Result">{`Answer: ${result ? 'true' : 'false'}`}</output>
  return <section aria-label="Unique occurrences focus" style={{ display: 'grid', gap: 12 }}>
    {['select', 'read', 'write'].includes(kind) && <div aria-label="Value being scanned" style={{ display: 'grid', gap: 4, justifyItems: 'start' }}>
      <small>position {position}</small>
      <span style={chip(true)} data-value={value}>{value}</span>
    </div>}
    {['read', 'write', 'select-count', 'check-free', 'clash', 'claim'].includes(kind) && kind !== 'claim' && <div aria-label="Map entry being updated" style={{ display: 'grid', gap: 4 }}>
      <strong>Map entry</strong>
      <span style={chip(true)} data-value={value}>
        {value} → {kind === 'write' ? count : (kind === 'read' ? old : (entry ? entry.count : count))}×
      </span>
    </div>}
    {transfer && kind !== 'read' && <output aria-label="Transfer">
      {kind === 'write' ? `Element ${value} at position ${position} → map entry ${value}` : `Map entry ${value} → claimed count ${count}`}
    </output>}
    {kind === 'read' && <output aria-label="Transfer">{`Element ${value} at position ${position} reads map entry ${value}`}</output>}
    {['select-count', 'check-free', 'clash', 'claim'].includes(kind) && <div aria-label="Claimed set entry" style={{ display: 'grid', gap: 4 }}>
      <strong>Claimed count</strong>
      {claim ? <span style={chip(true)} data-count={claim.count}>{claim.count} claimed by {claim.value}</span> : <em>none for {count}</em>}
      {clash !== null && <output aria-label="Clash">{`Count ${count} is already claimed by value ${clash}.`}</output>}
    </div>}
  </section>
}

function UniqueOccurrencesBody({ run, step }) {
  const scene = useTutorialScene()
  if (scene) return <FocusedScene run={run} focus={scene.focus} />
  {
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
  }
}

export default function UniqueOccurrencesVisual() {
  return <AlgorithmWorkspace definition={definition} tutorial={uniqueOccurrencesTutorial}
    renderVisual={({ run, step }) => <UniqueOccurrencesBody run={run} step={step} />}
    renderReasoning={() => <p><strong>Two structures:</strong> a map counts each value, then a set records each occurrence count. A second value with a count already in the set is the only way to return false.</p>} />
}
