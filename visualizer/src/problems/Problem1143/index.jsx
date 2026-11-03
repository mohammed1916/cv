import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples,
  url: `https://leetcode.com/problems/${meta.slug}/`,
}

function DpTable({ snapshot }) {
  const { first, second, table, cell } = snapshot
  return <div style={{ overflowX: 'auto' }}>
    <table aria-label="Common subsequence table">
      <thead><tr><th scope="col" /><th scope="col">·</th>{[...second].map((letter, j) => <th key={j} scope="col">{letter}</th>)}</tr></thead>
      <tbody>{table.map((row, i) => <tr key={i}>
        <th scope="row">{i === 0 ? '·' : first[i - 1]}</th>
        {row.map((value, j) => {
          const current = cell && cell[0] === i && cell[1] === j
          return <td key={j} style={{ padding: '4px 8px', textAlign: 'center', border: '1px solid #94a3b8', background: current ? '#a855f7' : 'transparent' }}>
            {value ?? ''}
          </td>
        })}
      </tr>)}</tbody>
    </table>
  </div>
}

export default function LongestCommonSubsequenceVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <DpTable snapshot={step.snapshot} />}
    renderReasoning={() => <p>A matching letter can only extend the diagonal from the cell before both letters. A mismatch means one of the two letters cannot both be used, so the cell takes the better neighbour.</p>} />
}
