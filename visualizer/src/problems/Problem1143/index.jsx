import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import DPDependencyView from '../../components/shared/DPDependencyView'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples,
  url: `https://leetcode.com/problems/${meta.slug}/`,
}

// Cells read by the cell being filled: the diagonal on a match, otherwise the two neighbours (larger one chosen).
function sourcesFor(s) {
  if (!s.cell) return []
  const [i, j] = s.cell
  if (s.same) return [{ cell: [i - 1, j - 1], note: 'diagonal, plus one matched letter', chosen: true }]
  const up = s.table[i - 1][j], left = s.table[i][j - 1]
  return [
    { cell: [i - 1, j], note: 'drop the last letter of first', chosen: up >= left },
    { cell: [i, j - 1], note: 'drop the last letter of second', chosen: left > up },
  ]
}

export default function LongestCommonSubsequenceVisual() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => {
      const s = step.snapshot
      return <DPDependencyView title="LCS table"
        shape="grid" values={s.table} target={s.cell ?? [0, 0]} sources={sourcesFor(s)}
        labels={{ rows: ['·', ...[...s.first]], columns: ['·', ...[...s.second]] }}
        recurrence={s.cell && s.same ? 'dp[i][j] = dp[i-1][j-1] + 1 when the letters match' : 'dp[i][j] = max(dp[i-1][j], dp[i][j-1]) when they differ'}
        why="Each cell is the best common length for one prefix of each string, so the bottom-right cell covers both whole strings." />
    }}
    renderReasoning={({ step }) => <>
      <p>A matching letter can only extend the diagonal from the cell before both letters. A mismatch means one of the two letters cannot both be used, so the cell keeps the better neighbour.</p>
      <p>{step.message}</p>
    </>} />
}
