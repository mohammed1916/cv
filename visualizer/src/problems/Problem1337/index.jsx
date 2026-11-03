import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1337',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with mat (0/1 rows) and k (JSON)',
  url: 'https://leetcode.com/problems/the-k-weakest-rows-in-a-matrix/',
  complexity: 'O(m·n + m log m) time: count each row once, then sort the m row pairs.',
  examples: [
    { label: 'Mixed', input: '{"mat":[[1,1,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,1,0,0,0],[1,1,1,1,1]],"k":3}' },
    { label: 'Ties', input: '{"mat":[[1,0],[1,0],[0,0],[1,0]],"k":4}' },
    { label: 'Single', input: '{"mat":[[1,1,1],[0,0,1],[1,0,0]],"k":1}' },
  ],
}

export default function KWeakestRows() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { rows, keyed, order, chosen, current } = step.snapshot
    const chosenSet = new Set(chosen ?? [])
    return <>
      <table aria-label="Matrix rows" style={{ borderCollapse: 'collapse', fontFamily: 'monospace', marginBottom: 12 }}>
        <tbody>{rows.map((row, i) => <tr key={i} data-row={i} style={{ background: i === current ? 'var(--surface2)' : chosenSet.has(i) ? '#bbf7d0' : 'transparent' }}>
          <th style={{ padding: '2px 8px', textAlign: 'left' }}>row {i}</th>
          {row.map((v, j) => <td key={j} style={{ padding: '2px 8px', color: '#1c1917', background: v ? '#fde68a' : '#f5f5f4' }}>{v}</td>)}
        </tr>)}</tbody>
      </table>
      <p>{keyed.length ? `Stored pairs (strength, row): ${keyed.map(([c, i]) => `(${c}, ${i})`).join(' ')}` : 'No row has been scored yet.'}</p>
      {order && <p>{`Sorted order: ${order.map(([c, i]) => `row ${i}`).join(' → ')}`}</p>}
      {chosen && <p><strong>Answer so far:</strong> rows {chosen.join(', ')}</p>}
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Strength is a count:</strong> the soldiers in a row are its ones, so counting them is a single pass over that row.</p>
    <p><strong>Ties need the index:</strong> pairing each count with its row index makes the sort deterministic, so equal rows come out in their original order.</p>
    <p>{step.snapshot.chosen ? 'The first k entries of the sorted list are the answer.' : 'Score every row, then sort the pairs.'}</p>
  </>} />
}
