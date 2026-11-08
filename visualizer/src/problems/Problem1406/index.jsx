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
    { label: "Single value", input: "[7]" },
    { label: "Equal values", input: "[3,3]" },
    { label: "Twelve maximum values", input: "[50,50,50,50,50,50,50,50,50,50,50,50]" },
    { label: "Long run: 12 values", input: "[28,31,2,22,-7,41,-12,25,26,-15,24,8]" },
  ],
}

import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'

const tile = { minWidth: 52, padding: 12, textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', background: 'var(--surface2)' }

// The stones in a row. The current start and the stones it may take are outlined; the sum of the taken stones is shown.
function StoneRow({ values, start, take }) {
  const taken = new Set(start !== null && start !== undefined ? Array.from({ length: take ?? 1 }, (_, k) => start + k) : [])
  return <div role="img" aria-label="Stones in a row" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
    {values.map((value, i) => <div key={i} style={{ ...tile, borderWidth: taken.has(i) ? 2 : 1, borderColor: taken.has(i) ? 'var(--primary)' : 'var(--border)', opacity: start !== null && start !== undefined && !taken.has(i) && i < start ? 0.5 : 1 }}>
      <div>{value}</div><small>{i}</small>
    </div>)}
  </div>
}

export default function StoneGameIII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { values, start, take, best, option, winner } = step.snapshot
    const n = values.length
    // Each start depends on the next one to three cells of the table (the table has one extra cell for the empty suffix).
    const related = start !== null && start !== undefined ? Array.from({ length: 3 }, (_, k) => ({ row: 0, column: start + 1 + k })).filter(c => c.column <= n) : []
    return <>
      <StoneRow values={values} start={start} take={take} />
      <DPTable title="best advantage from each start" values={[best]} activeCell={start !== null && start !== undefined ? { row: 0, column: start } : null}
        relatedCells={related} rowLabels={['best']} columnLabels={Array.from({ length: n + 1 }, (_, i) => i)} />
      <p style={{ color: 'var(--text)' }}>
        {start !== null && start !== undefined
          ? `From start ${start}, taking ${take} stone${take === 1 ? '' : 's'} is worth ${option}. The highlighted cells after start are the choices the opponent can make next.`
          : 'Fill the table from the right end. Each cell only looks at the three cells to its right.'}
      </p>
      {winner && <p style={{ color: 'var(--text)' }}>Result: <strong>{winner}</strong> (best[0] = {best[0]})</p>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Suffix table:</strong> the best advantage from a start depends only on the suffix after it, so each suffix is solved once, from the right.</p>
    <p><strong>Handing over the turn:</strong> taking stones earns their sum, but the opponent then moves from the remaining suffix, so that suffix's advantage is subtracted.</p>
  </>} />
}
