import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1959',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with nums and k (e.g. {"nums":[10,20,5],"k":1})',
  url: 'https://leetcode.com/problems/minimum-total-space-wasted-with-k-resizing-operations/',
  complexity: 'O(k · n²) time with a table of (k + 1) by n cells. The visualization caps n at 8.',
  examples: [
    { label: 'One resize', input: '{"nums":[10,20,5],"k":1}' },
    { label: 'No resize', input: '{"nums":[10,20],"k":0}' },
    { label: 'Single value', input: '{"nums":[7],"k":0}' },
    { label: 'Equal values', input: '{"nums":[5,5,5],"k":2}' },
    { label: 'Largest values, eight items', input: '{"nums":[50,50,50,50,50,50,50,50],"k":7}' },
    { label: 'Long run: eight values', input: '{"nums":[13,50,21,38,27,16,29,6],"k":3}' },
  ],
}

export default function Problem1959Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => {
      const n = run.input.nums.length
      return <>
        <p>Values: <strong>{run.input.nums.join(', ')}</strong></p>
        <table aria-label="Minimum waste table" style={{ borderCollapse: 'collapse' }}>
          <thead><tr><th>blocks \ values used</th>{Array.from({ length: n + 1 }, (_, i) => <th key={i}>{i}</th>)}</tr></thead>
          <tbody>{step.table.map((row, b) => <tr key={b}><th>{b}</th>{row.map((v, i) => {
            const current = b === step.blocks && i === step.end
            return <td key={i} style={{ width: 40, height: 30, textAlign: 'center', border: '1px solid var(--border)', outline: current ? '2px solid var(--primary)' : 'none', background: v !== null && b > 0 ? 'var(--surface2)' : 'transparent' }}>{v === null ? '∞' : v}</td>
          })}</tr>)}</tbody>
        </table>
        <p>Each cell: the least waste for the first i values split into exactly b blocks. A block of values is sized to its largest value.</p>
        {step.result !== undefined && <output aria-label="Minimum waste">Minimum waste: {step.result}</output>}
      </>
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
