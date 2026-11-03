import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases, inputLabel, complexity, examples } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples,
  url: 'https://leetcode.com/problems/path-with-maximum-gold/',
}

const cell = { width: 46, height: 46, boxSizing: 'border-box', display: 'grid', placeItems: 'center', border: '1px solid var(--border)', borderRadius: 4, fontFamily: 'monospace' }

export default function PathWithMaximumGold() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const usedKeys = new Set(step.snapshot.used.map(([r, c]) => `${r},${c}`))
    const current = step.snapshot.cell
    const isCurrent = (r, c) => current && current[0] === r && current[1] === c
    const next = step.snapshot.next
    return <>
      <div aria-label="Gold grid" role="img" style={{ display: 'grid', gridTemplateColumns: `repeat(${run.input[0].length}, 46px)`, gap: 4, width: 'max-content' }}>
        {run.input.flatMap((row, r) => row.map((gold, c) => {
          const key = `${r},${c}`
          return <span key={key} data-cell={key} style={{
            ...cell,
            background: isCurrent(r, c) ? '#facc15' : usedKeys.has(key) ? 'rgba(8,145,178,.25)' : gold > 0 ? 'var(--surface2)' : 'transparent',
            color: isCurrent(r, c) ? '#1c1917' : 'var(--text)',
            borderWidth: next && next[0] === r && next[1] === c ? 2 : 1,
            borderColor: next && next[0] === r && next[1] === c ? '#0891b2' : 'var(--border)',
          }}>{gold}</span>
        }))}
      </div>
      <p aria-label="Current path total">Best so far: {step.snapshot.answer}{step.snapshot.value !== undefined ? ` · this path from here: ${step.snapshot.value}` : ''}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Why unmark:</strong> a path may not revisit a cell, but a different path may pass through the same cell. Releasing the cell on return keeps every start independent.</p>
    <p>Each cell's answer is its own gold plus the best continuation through an unused neighbour, so the recursion returns the best total from that cell.</p>
  </>} />
}
