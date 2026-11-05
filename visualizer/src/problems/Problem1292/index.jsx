import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PrefixLookupView from './PrefixLookupView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1292',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Matrix and threshold (JSON)',
  url: 'https://leetcode.com/problems/maximum-side-length-of-a-square-with-sum-less-than-or-equal-to-threshold/',
  complexity: 'O(m * n) time after O(m * n) prefix sums: each cell only tries to grow the best side by one step at a time.',
  examples: [
    { label: 'Growing block', input: '{"mat":[[1,1,3],[1,2,4],[2,2,2]],"threshold":6}' },
    { label: 'Nothing fits', input: '{"mat":[[2,2],[2,2]],"threshold":1}' },
    { label: 'Zeros', input: '{"mat":[[0,0,0],[0,0,0]],"threshold":0}' },
  ],
}

export default function SquareThreshold() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { cell, side, sum, fits, best, threshold, prefix } = step.snapshot
    return <>
      <PrefixLookupView prefix={prefix} cell={cell} side={side} />
      <table aria-label="Matrix values" style={{ borderCollapse: 'collapse', fontFamily: 'monospace' }}>
        <tbody>{run.input.mat.map((row, i) => <tr key={i}>{row.map((v, j) => {
          const inSquare = cell && side && i <= cell[0] && i > cell[0] - side && j <= cell[1] && j > cell[1] - side
          const isCell = cell && cell[0] === i && cell[1] === j
          return <td key={j} style={{
            width: 36, height: 36, textAlign: 'center', border: `${isCell ? 2 : 1}px solid ${isCell ? 'var(--text)' : 'var(--border)'}`,
            background: inSquare ? (fits ? 'color-mix(in srgb, var(--success) 30%, var(--surface))' : 'color-mix(in srgb, var(--error) 30%, var(--surface))') : 'transparent', color: 'var(--text)',
          }}>{v}</td>
        })}</tr>)}</tbody>
      </table>
      <p>{cell === null ? `Best side so far: ${best}. Threshold ${threshold}.` : `Cell (${cell[0]}, ${cell[1]}): ${side === null ? 'choosing the next cell' : `side ${side} sums to ${sum} ${fits ? '(fits)' : '(too large)'}`}. Best: ${best}.`}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Prefix sums:</strong> any square is four table lookups, so testing a size costs constant time.</p>
    <p><strong>Monotone growth:</strong> with non-negative values, if a square fits at one size, smaller squares at the same corner fit too; so the best side only needs to grow by one step at a time.</p>
  </>} />
}
