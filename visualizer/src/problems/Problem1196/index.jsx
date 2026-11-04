import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, inputLabel, complexity, examples } from './algorithm'

const definition = {
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, pythonLineMap, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`, complexity, examples,
}

const CAPACITY = 5000

export default function ApplesBasketVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { sorted, taken, index, total, count, fits } = step.snapshot
    const pct = Math.min(100, (total / CAPACITY) * 100)
    return <>
      <div role="list" aria-label="Sorted apples, lightest first" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {sorted.map((weight, position) => {
          const isTaken = position < taken.length
          const isCurrent = index === position
          const role = isCurrent && fits === false ? 'too heavy' : isCurrent ? 'checking' : isTaken ? 'in basket' : 'left out'
          return <span key={position} role="listitem" data-index={position} style={{
            display: 'grid', justifyItems: 'center', padding: '6px 8px', borderRadius: 6, fontFamily: 'monospace',
            border: isCurrent ? '2px solid var(--text)' : '1px solid var(--border)',
            background: isTaken ? 'color-mix(in srgb, var(--primary) 30%, transparent)' : 'var(--surface2)',
            color: 'var(--text)', opacity: isTaken || isCurrent ? 1 : 0.6,
          }}>
            <strong>{weight}</strong>
            <small style={{ color: 'var(--text-dim)' }}>{role}</small>
          </span>
        })}
      </div>
      <div aria-label="Basket fill" role="img" style={{ marginTop: 12, height: 14, border: '1px solid var(--border)', background: 'var(--surface2)' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)' }} />
      </div>
      <p>Basket weight {total} of {CAPACITY}. Apples taken: {count}.</p>
      <output aria-label="Count so far">{`Count: ${count} · ${step.message ?? ''}`}</output>
    </>
  }} renderReasoning={() => <p><strong>Greedy choice:</strong> taking lighter apples first gives the largest count. Once the lightest remaining apple does not fit, no heavier apple after it can fit.</p>} />
}
