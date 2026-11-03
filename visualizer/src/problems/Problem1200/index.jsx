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
    const current = index ?? -1
    return <>
      <div role="list" aria-label="Sorted values" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {sorted.map((value, position) => {
          const inGap = current >= 0 && (position === current || position === current + 1)
          return <span key={position} role="listitem" data-index={position} style={{
            padding: '6px 8px', borderRadius: 6, fontFamily: 'monospace',
            border: inGap ? '2px solid var(--text)' : '1px solid var(--border)',
            background: inGap ? '#0891b2' : 'transparent', color: inGap ? '#fff' : 'var(--text)',
          }}>{value}</span>
        })}
      </div>
      <p>Smallest gap so far: {best ?? 'not set'}</p>
      <output aria-label="Pairs so far">{`Pairs: ${pairs.map(([a, b]) => `[${a}, ${b}]`).join(', ') || 'none yet'}`}</output>
    </>
  }} renderReasoning={() => <p><strong>Sorting first:</strong> after sorting, the closest two values are always neighbours, so only adjacent gaps need checking.</p>} />
}
