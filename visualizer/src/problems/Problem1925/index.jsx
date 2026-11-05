import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1925',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Bound n (1 to 12)',
  url: 'https://leetcode.com/problems/count-square-sum-triples/',
  complexity: 'O(n²) pairs with an integer square-root test each. The visualization caps n at 12.',
  examples: [
    { label: 'n = 5', input: '5' },
    { label: 'n = 10', input: '10' },
  ],
}

export default function Problem1925Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => {
      const n = run.input.n
      const hitSet = new Set(step.hits.map(([a, b]) => `${a},${b}`))
      return <>
        <table aria-label="Pairs (a, b)" style={{ borderCollapse: 'collapse' }}>
          <thead><tr><th>a \ b</th>{Array.from({ length: n }, (_, j) => <th key={j}>{j + 1}</th>)}</tr></thead>
          <tbody>{Array.from({ length: n }, (_, i) => <tr key={i}><th>{i + 1}</th>{Array.from({ length: n }, (_, j) => {
            const a = i + 1, b = j + 1
            const current = a === step.a && b === step.b
            const hit = hitSet.has(`${a},${b}`)
            return <td key={j} style={{ width: 34, height: 30, textAlign: 'center', border: '1px solid var(--border)', background: hit ? 'color-mix(in srgb, var(--success, #16a34a) 30%, var(--surface2))' : 'var(--surface2)', outline: current ? '2px solid var(--primary)' : 'none' }}>{hit ? step.hits.find(([x, y]) => x === a && y === b)[2] : ''}</td>
          })}</tr>)}</tbody>
        </table>
        <p>Green cells hold the hypotenuse c. Outlined cell is the pair being tested.</p>
        <output aria-label="Count so far">Count: {step.count}</output>
      </>
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
