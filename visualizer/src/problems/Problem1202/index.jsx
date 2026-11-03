import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, pythonLineMap, phases, inputLabel, complexity, examples } from './algorithm'

const definition = {
  number: meta.number, phases, parse: parseInput, build: buildTrace, code, python, pythonLineMap, inputLabel,
  url: `https://leetcode.com/problems/${meta.slug}/`, complexity, examples,
}

const TONES = ['#0891b2', '#14b8a6', '#f59e0b', '#a855f7', '#ef4444', '#22c55e', '#6366f1', '#ec4899']

function rootOf(parent, x) {
  let cur = x
  while (parent[cur] !== cur) cur = parent[cur]
  return cur
}

export default function SmallestStringWithSwapsVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { letters, parent, result, group } = step.snapshot
    const groupSet = new Set(group ?? [])
    const roots = [...new Set(letters.map((_, i) => rootOf(parent, i)))]
    return <>
      <div role="list" aria-label="Positions and components" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {letters.map((letter, position) => {
          const tone = TONES[roots.indexOf(rootOf(parent, position)) % TONES.length]
          return <span key={position} role="listitem" data-index={position} style={{
            padding: '6px 8px', borderRadius: 6, fontFamily: 'monospace', color: '#fff',
            border: groupSet.has(position) ? '2px solid var(--text)' : '1px solid var(--border)',
            background: tone,
          }}>{result[position]}</span>
        })}
      </div>
      <p>Original: {letters.join('')} · Current: {result}</p>
    </>
  }} renderReasoning={() => <p><strong>Components:</strong> positions linked by any chain of allowed swaps can exchange letters freely, so each component is sorted independently.</p>} />
}
