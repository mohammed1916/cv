import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, inputLabel, complexity, examples } from './algorithm'

const definition = {
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, pythonLineMap, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`, complexity, examples,
}

export default function MinimumAbsoluteDifferenceVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { sorted, index, pairs, best } = step.snapshot
    const left = index ?? -1
    const right = left + 1
    const isPair = i => i === left || i === right
    return <>
      <div role="list" aria-label="Sorted values" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'flex-end' }}>
        {sorted.map((value, position) => {
          const role = position === left && left >= 0 ? 'l' : position === right && left >= 0 ? 'r' : ''
          return <span key={position} role="listitem" data-index={position} style={{
            display: 'grid', justifyItems: 'center', padding: '6px 8px', borderRadius: 6, fontFamily: 'monospace',
            border: isPair(position) ? '2px solid var(--text)' : '1px solid var(--border)',
            background: isPair(position) ? 'color-mix(in srgb, var(--primary) 30%, transparent)' : 'var(--surface2)',
            color: 'var(--text)',
          }}>
            <strong>{value}</strong>
            <small style={{ color: 'var(--text-dim)', minHeight: '1em' }}>{role}</small>
          </span>
        })}
      </div>
      <p>Smallest gap so far: {best ?? 'not set'}. The pair being compared is l and r.</p>
      <output aria-label="Pairs so far">{`Pairs: ${pairs.map(([a, b]) => `[${a}, ${b}]`).join(', ') || 'none yet'}`}</output>
    </>
  }} renderReasoning={() => <p><strong>Sorting first:</strong> after sorting, the closest two values are always neighbours, so only adjacent gaps need checking. Each step compares the pair at l and r.</p>} />
}
