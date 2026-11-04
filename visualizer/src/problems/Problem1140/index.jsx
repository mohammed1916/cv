import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases, examples, complexity, inputLabel } from './algorithm'
import DPDependencyView from '../../components/shared/DPDependencyView'
import { Sequence, Vars } from './SeqKit'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python, inputLabel, complexity, examples,
  url: `https://leetcode.com/problems/${meta.slug}/`,
}

export default function StoneGameIIVisual() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const s = step.snapshot
    const n = s.piles.length
    const cell = s.cell
    const sources = []
    if (cell) {
      const [i, M] = cell
      const maxX = Math.min(2 * M, n - i)
      for (let X = 1; X <= maxX; X++) sources.push({ cell: [i + X, Math.max(M, X)], note: `take ${X} pile${X === 1 ? '' : 's'}`, chosen: X === s.choice })
    }
    return <>
      <Sequence label="Piles (shaded: still on the table from the current pile)" values={s.piles} marks={cell ? Object.fromEntries(s.piles.map((_, k) => [k, k >= cell[0] ? 'window' : ''])) : {}} pointers={cell ? { pile: cell[0] } : {}} />
      <DPDependencyView title="Best total the player to move can collect"
        shape="grid" values={s.table} target={cell ?? [0, 1]} sources={sources}
        labels={{ rows: Array.from({ length: n + 1 }, (_, i) => (i === n ? 'end' : `pile ${i}`)), columns: Array.from({ length: n + 1 }, (_, M) => (M === 0 ? '-' : `M=${M}`)) }}
        recurrence="best[i][M] = max over X of suffix[i] - best[i+X][max(M, X)]"
        why="After taking X piles the opponent moves next on what is left, so their best total is subtracted from everything still on the table." />
      <Vars vars={{ 'current pile i': cell ? cell[0] : null, 'limit M': cell ? cell[1] : null, 'piles taken (choice)': s.choice ?? null, 'stones from i on': cell ? s.suffix[cell[0]] : null }} />
      <output aria-label="Result">{step.message}</output>
    </>
  }} renderReasoning={() => <p>Each pile choice leaves the opponent a smaller game with a larger limit. The table stores the best total for every pile and limit, so the first player's answer is read from the top cell.</p>} />
}
