import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

function SensorTiling({ run }) {
  const { n, m, k } = run.input
  const side = 2 * k + 1
  const rows = Math.ceil(n / side), cols = Math.ceil(m / side)
  const W = 240, cell = Math.min(W / Math.max(1, cols), W / Math.max(1, rows))
  return <svg viewBox={`0 0 ${cols * cell + 2} ${rows * cell + 2}`} role="img" aria-label={`Sensor squares of side ${side} tiling the grid`} style={{ width: 240, maxWidth: '100%' }}>
    {Array.from({ length: rows * cols }, (_, i) => {
      const r = Math.floor(i / cols), c = i % cols
      return <rect key={i} x={c * cell + 1} y={r * cell + 1} width={cell - 2} height={cell - 2} fill="var(--primary)" fillOpacity="0.35" stroke="var(--text)" />
    })}
  </svg>
}

const definition = {
  phases: [
    { id: 'side', label: 'Block', description: 'A sensor covers a square of side 2k + 1 around it.' },
    { id: 'rows', label: 'Rows', description: 'Stack bands of that height down the rows.' },
    { id: 'cols', label: 'Columns', description: 'Stack bands of that width across the columns.' },
    { id: 'done', label: 'Complete', description: 'The sensor count is rows times columns.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with n, m and k',
  url: 'https://leetcode.doocs.org/en/lc/3648/',
  complexity: 'O(1) time: two ceiling divisions.',
  examples: [
    { label: 'Example 1', input: '{"n":5,"m":5,"k":1}' },
    { label: 'Example 2', input: '{"n":2,"m":2,"k":2}' },
  ],
}

export default function MinimumSensorsGrid() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <SensorTiling run={run} />
    <output aria-label="Grid">{`Grid ${run.input.n} by ${run.input.m}, k = ${run.input.k}`}</output>
    <output aria-label="Bands">{`Rows: ${step.rows ?? '-'}, columns: ${step.cols ?? '-'}, sensors: ${step.result ?? '-'}`}</output>
  </>} renderReasoning={() => <>
    <p>A sensor covers every cell within Chebyshev distance k, which is a square of side 2k+1 centred on it.</p>
    <p>Squares of that side tile the grid, and the rows and columns can be counted separately, so the count is a product of two ceiling divisions.</p>
  </>} />
}
