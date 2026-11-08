import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1260',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid and shift amount (JSON)',
  url: 'https://leetcode.com/problems/shift-2d-grid/',
  complexity: 'O(m * n) time to move every cell once, and O(m * n) space for the shifted table.',
  examples: [
    { label: 'Three by two', input: '{"grid":[[1,2],[3,4],[5,6]],"k":2}' },
    { label: 'Full wrap', input: '{"grid":[[7,8],[9,1]],"k":4}' },
    { label: 'One step', input: '{"grid":[[1,2,3],[4,5,6]],"k":1}' },
    { label: 'Zero shift', input: '{"grid":[[1,2],[3,4]],"k":0}' },
    { label: 'Single cell', input: '{"grid":[[42]],"k":5}' },
    { label: 'Largest grid, big shift', input: '{"grid":[[68,19,98,79,67,58],[79,57,13,81,74,21],[99,85,34,65,25,98],[20,95,98,16,52,47],[23,35,30,75,92,50],[29,9,37,78,90,34]],"k":60}' },
    { label: 'Long run: 6 by 6 grid', input: '{"grid":[[14,15,17,29,94,65],[22,72,98,59,80,53],[58,26,12,69,29,74],[34,12,28,46,2,57],[55,35,11,37,42,82],[74,52,96,36,27,58]],"k":37}' },
  ],
}

function Table({ rows, label, highlight }) {
  return <table aria-label={label} style={{ borderCollapse: 'collapse', fontFamily: 'monospace' }}>
    <tbody>{rows.map((row, r) => <tr key={r}>{row.map((v, c) => {
      const active = highlight && highlight[0] === r && highlight[1] === c
      return <td key={c} data-cell={`${r},${c}`} style={{
        width: 46, height: 36, textAlign: 'center', border: `${active ? 2 : 1}px solid ${active ? 'var(--text)' : 'var(--border)'}`,
        background: v === null ? 'transparent' : 'color-mix(in srgb, var(--primary) 25%, transparent)', color: 'var(--text)',
      }}>{v === null ? '' : v}</td>
    })}</tr>)}</tbody>
  </table>
}

export default function Shift2DGrid() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { source, result, index, target, complete } = step.snapshot
    const n = source[0].length
    const at = i => (i === undefined || i < 0 ? null : [Math.floor(i / n), i % n])
    const from = at(index)
    const to = at(target)
    return <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <div>
        <p>Source</p>
        <Table rows={source} label="Source grid" highlight={from} />
      </div>
      <div>
        <p>Shifted {complete ? '(complete)' : '(filling)'}</p>
        <Table rows={result} label="Shifted grid" highlight={to} />
      </div>
    </div>
  }} renderReasoning={({ step }) => <>
    <p><strong>Flat view:</strong> reading the grid row by row turns it into one line of m * n cells. Shifting by k moves each cell k places forward along that line, wrapping around.</p>
    <p><strong>Converting back:</strong> a flat index i sits at row floor(i / n) and column i mod n, so the move can be written directly into the new table.</p>
    <p>{step.snapshot.kEff === 0 ? 'The reduced shift is 0, so every value stays where it is.' : `The reduced shift is ${step.snapshot.kEff}.`}</p>
  </>} />
}
