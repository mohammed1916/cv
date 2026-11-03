import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1406',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Stone values (JSON array)',
  url: 'https://leetcode.com/problems/stone-game-iii/',
  complexity: 'O(n) time: each start position tries at most three takes. O(n) extra space for the best-advantage table.',
  examples: [
    { label: 'Alice wins', input: '[4, -1, 6]' },
    { label: 'Single stone', input: '[0]' },
    { label: 'Negative start', input: '[-2, 5, -3]' },
  ],
}

const cell = { minWidth: 52, padding: '6px 8px', textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }

export default function StoneGameIII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { values, start, take, best, option, winner } = step.snapshot
    const active = new Set(start !== null && start !== undefined ? Array.from({ length: take ?? 1 }, (_, k) => start + k) : [])
    return <>
      <div role="img" aria-label="Stones in a row" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {values.map((value, i) => <div key={i} style={{ ...cell, borderWidth: active.has(i) ? 2 : 1, background: active.has(i) ? 'var(--surface2)' : 'transparent' }}>
          <div>{value}</div><small>{i}</small>
        </div>)}
      </div>
      <p>Best advantage from each start (index {values.length} is 0 with no stones):</p>
      <div role="table" aria-label="Best advantage by start index" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {best.map((value, i) => <div key={i} style={cell}><div>{value === null ? '·' : value}</div><small>{i}</small></div>)}
      </div>
      {option !== undefined && <p>Latest option is worth <strong>{option}</strong>.</p>}
      {winner && <p>Winner: <strong>{winner}</strong></p>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Suffix table:</strong> the best advantage from a start depends only on the suffix after it, so each suffix is solved once, from the right.</p>
    <p><strong>Handing over the turn:</strong> taking stones earns their sum, but the opponent then moves from the remaining suffix, so that suffix's advantage is subtracted.</p>
  </>} />
}
