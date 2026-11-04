import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1686',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with alice and bob value lists (JSON)',
  url: 'https://leetcode.com/problems/stone-game-vi/',
  complexity: 'O(n log n) time for the ranking and O(n) for the turns. Space is O(n).',
  examples: [
    { label: 'Alice ahead', input: '{"alice":[1,5,9,2],"bob":[4,3,2,8]}' },
    { label: 'Tie', input: '{"alice":[2,2],"bob":[2,2]}' },
    { label: 'Bob ahead', input: '{"alice":[1,1,1],"bob":[9,9,9]}' },
  ],
}

const cell = { padding: '6px 10px', border: '1px solid var(--border)', fontFamily: 'monospace', textAlign: 'center', color: 'var(--text)' }

// Stones ranked by combined value. Each one shows who took it, and the turn it was taken on.
function Ranking({ order, total, takenBy, current }) {
  if (!order) return <p style={{ color: 'var(--text-muted, var(--text))' }}>Stones are ranked once the combined values are known.</p>
  return <ol aria-label="Ranking by combined value" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
    {order.map((stone, turn) => {
      const player = takenBy.get(stone)
      const isNow = stone === current
      return <li key={stone} style={{
        minWidth: 74, padding: '6px 8px', borderRadius: 8, textAlign: 'center', fontFamily: 'monospace', boxSizing: 'border-box',
        border: `2px solid ${isNow ? 'var(--primary)' : 'var(--border)'}`,
        background: player === 'Alice' ? 'var(--primary)' : player === 'Bob' ? 'var(--surface2)' : 'var(--surface)',
        color: player === 'Alice' ? 'var(--on-primary, #fff)' : 'var(--text)',
      }}>
        <div>turn {turn + 1}</div>
        <strong>stone {stone}</strong>
        <div>sum {total[stone]}</div>
        <div style={{ fontSize: 12 }}>{player ?? 'open'}</div>
      </li>
    })}
  </ol>
}

export default function StoneGameVI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { alice, bob } = run.input
    const { total, taken, aliceSum, bobSum, current, order } = step.snapshot
    const takenBy = new Map(taken.map(t => [t.stone, t.player]))
    const max = Math.max(1, aliceSum, bobSum)
    return <>
      <p style={{ margin: '0 0 6px' }}>Each stone is worth a different amount to each player. Ranking by the combined value is the order both players want.</p>
      <Ranking order={order} total={total} takenBy={takenBy} current={current} />
      <table aria-label="Stones" style={{ borderCollapse: 'collapse', margin: '12px 0' }}>
        <thead><tr><th style={cell}>stone</th><th style={cell}>Alice</th><th style={cell}>Bob</th><th style={cell}>total</th><th style={cell}>taken by</th></tr></thead>
        <tbody>{alice.map((a, i) => <tr key={i} style={{ background: i === current ? 'var(--surface2)' : undefined }}>
          <td style={cell}>{i}</td><td style={cell}>{a}</td><td style={cell}>{bob[i]}</td><td style={cell}>{total[i]}</td><td style={cell}>{takenBy.get(i) ?? '-'}</td>
        </tr>)}</tbody>
      </table>
      <div aria-label="Score bars" style={{ display: 'grid', gap: 6, fontFamily: 'monospace' }}>
        <div>Alice <span style={{ display: 'inline-block', height: 10, width: `${(aliceSum / max) * 70}%`, background: 'var(--primary)', verticalAlign: 'middle' }} /> {aliceSum}</div>
        <div>Bob <span style={{ display: 'inline-block', height: 10, width: `${(bobSum / max) * 70}%`, background: 'var(--text-muted, var(--text))', verticalAlign: 'middle' }} /> {bobSum}</div>
      </div>
    </>
  }} renderReasoning={() => <>
    <p><strong>Key idea:</strong> the stone with the largest combined value is worth the most to whoever takes it, because taking it also denies the opponent.</p>
    <p><strong>Greedy order:</strong> sort by combined value and alternate picks. Alice gets the even positions, Bob the odd ones.</p>
  </>} />
}
