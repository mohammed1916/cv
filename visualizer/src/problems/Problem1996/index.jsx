import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1996',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Characters as [attack, defense] pairs (JSON)',
  url: 'https://leetcode.com/problems/the-number-of-weak-characters-in-the-game/',
  complexity: 'O(n log n) time for the sort and O(n) for the scan.',
  examples: [
    { label: 'Dominated pair', input: '[[4,9],[2,3],[7,1]]' },
    { label: 'Equal attack', input: '[[6,4],[6,7],[5,5]]' },
    { label: 'Ties', input: '[[3,3],[3,3],[4,1]]' },
  ],
}

export default function WeakCharacters() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { sorted, index, row, maxDefense, weak, weakSet } = step.snapshot
    return <>
      <table aria-label="Characters sorted by attack" style={{ borderCollapse: 'collapse', fontFamily: 'monospace', color: 'var(--text)' }}>
        <thead><tr><th style={{ padding: '2px 8px' }}>order</th><th style={{ padding: '2px 8px' }}>attack</th><th style={{ padding: '2px 8px' }}>defense</th><th style={{ padding: '2px 8px' }}>status</th></tr></thead>
        <tbody>{sorted.map(([a, d], i) => {
          const weakRow = weakSet.includes(i)
          return <tr key={i} style={{ background: i === row ? 'var(--primary-glow)' : 'transparent' }}>
            <td style={{ border: '1px solid var(--border)', padding: '2px 8px' }}>{i}</td>
            <td style={{ border: '1px solid var(--border)', padding: '2px 8px' }}>{a}</td>
            <td style={{ border: '1px solid var(--border)', padding: '2px 8px' }}>{d}</td>
            <td style={{ border: '1px solid var(--border)', padding: '2px 8px' }}>{weakRow ? 'weak' : i <= index ? 'checked' : ''}</td>
          </tr>
        })}</tbody>
      </table>
      <p>Best defense of stronger attacks: <strong>{maxDefense}</strong>. Weak so far: <strong>{weak}</strong>.</p>
    </>
  }} renderReasoning={() => <p>Sorting by attack descending puts every stronger character before the ones it could be beaten by. A character is weak when its defense is below the best defense seen among strictly stronger attacks.</p>} />
}
