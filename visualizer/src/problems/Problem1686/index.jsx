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

const cell = { padding: '6px 10px', border: '1px solid var(--border)', fontFamily: 'monospace', textAlign: 'center' }

export default function StoneGameVI() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { alice, bob } = run.input
    const { total, taken, aliceSum, bobSum, current, order } = step.snapshot
    const takenBy = new Map(taken.map(t => [t.stone, t.player]))
    return <>
      <table aria-label="Stones" style={{ borderCollapse: 'collapse' }}>
        <thead><tr><th style={cell}>stone</th><th style={cell}>Alice</th><th style={cell}>Bob</th><th style={cell}>total</th><th style={cell}>taken by</th></tr></thead>
        <tbody>{alice.map((a, i) => <tr key={i} style={{ background: i === current ? 'var(--surface2)' : undefined }}>
          <td style={cell}>{i}</td><td style={cell}>{a}</td><td style={cell}>{bob[i]}</td><td style={cell}>{total[i]}</td><td style={cell}>{takenBy.get(i) ?? '-'}</td>
        </tr>)}</tbody>
      </table>
      <p>Alice {aliceSum} · Bob {bobSum}{order ? ` · order: ${order.join(' ')}` : ''}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Key idea:</strong> the stone with the largest combined value is worth the most to whoever takes it, because taking it also denies the opponent.</p>
    <p><strong>Greedy order:</strong> sort by combined value and alternate picks. Alice gets the even positions, Bob the odd ones.</p>
  </>} />
}
