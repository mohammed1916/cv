import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import AnswerRangeBar from '../../components/shared/AnswerRangeBar'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1970',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with row, col and cells (1-based), e.g. {"row":2,"col":2,"cells":[[1,1],[2,1],[1,2],[2,2]]}',
  url: 'https://leetcode.com/problems/last-day-where-you-can-still-cross/',
  complexity: 'O(log n) probes, each a breadth-first search over the grid: O(R·C·log n) in total.',
  examples: [
    { label: 'Two by two', input: '{"row":2,"col":2,"cells":[[1,1],[2,1],[1,2],[2,2]]}' },
    { label: 'Three by three', input: '{"row":3,"col":3,"cells":[[2,2],[2,1],[2,3]]}' },
  ],
}

export default function Problem1970Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => {
      const { row, col } = run.input
      const water = new Set(step.water.map(([r, c]) => `${r},${c}`))
      const reached = new Set((step.reached || []).map(([r, c]) => `${r},${c}`))
      return <>
        <AnswerRangeBar title="Day search" min={0} max={run.input.cells.length} low={step.lo} high={step.hi} probe={step.mid} verdict={step.verdict} />
        <div aria-label="Grid on the probed day" style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${col}, 36px)`, gap: 3 }}>
          {Array.from({ length: row * col }, (_, k) => {
            const r = Math.floor(k / col) + 1, c = (k % col) + 1
            const isWater = water.has(`${r},${c}`)
            const isReached = reached.has(`${r - 1},${c - 1}`)
            return <div key={k} style={{ height: 36, display: 'grid', placeItems: 'center', borderRadius: 4, border: '1px solid var(--border)', background: isWater ? 'color-mix(in srgb, var(--text) 45%, var(--surface2))' : isReached ? 'color-mix(in srgb, var(--success, #16a34a) 30%, var(--surface2))' : 'var(--surface2)', color: 'var(--text)' }}>{isWater ? 'W' : ''}</div>
          })}
        </div>
        <p>Dark cells are flooded. Green cells are land reachable from the top row on this day.</p>
        {step.result !== undefined && <output aria-label="Last day">Last day: {step.result}</output>}
      </>
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
