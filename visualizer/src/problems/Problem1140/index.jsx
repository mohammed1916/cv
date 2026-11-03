import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples,
  url: `https://leetcode.com/problems/${meta.slug}/`,
}

function TableView({ snapshot }) {
  const { piles, suffix, table, cell } = snapshot
  const n = piles.length
  const limits = Array.from({ length: n }, (_, k) => k + 1)
  return <div style={{ overflowX: 'auto' }}>
    <p>Piles: {piles.join(', ')} · Remaining stones from each pile: {suffix.slice(0, n).join(', ')}</p>
    <table aria-label="Stone game table">
      <thead><tr><th scope="col">pile \ limit M</th>{limits.map(M => <th key={M} scope="col">{M}</th>)}</tr></thead>
      <tbody>{piles.map((_, i) => <tr key={i}>
        <th scope="row">{i}</th>
        {limits.map(M => {
          const current = cell && cell[0] === i && cell[1] === M
          return <td key={M} style={{ padding: '4px 8px', border: '1px solid #94a3b8', background: current ? '#0891b2' : 'transparent' }}>
            {table[i][M] ?? '·'}
          </td>
        })}
      </tr>)}</tbody>
    </table>
  </div>
}

export default function StoneGameIIVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <>
      <TableView snapshot={step.snapshot} />
      {step.snapshot.choice ? <output aria-label="Chosen take">Take {step.snapshot.choice} pile(s)</output> : null}
    </>}
    renderReasoning={() => <p>Each cell depends only on cells to its right, so the table fills from the last pile backward. The opponent's best result from the remaining piles is subtracted from what is left.</p>} />
}
