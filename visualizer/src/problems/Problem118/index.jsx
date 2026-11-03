import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Number of rows (1 to 30)',
  url: 'https://leetcode.com/problems/pascals-triangle/',
  complexity: 'O(n²) time and O(n²) space for n rows, because the output itself has n(n + 1) / 2 entries.',
  examples: [
    { label: 'Four', input: '4' },
    { label: 'One', input: '1' },
    { label: 'Eight', input: '8' },
  ],
}

export default function PascalsTriangle() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { rows, row, cell, current } = step.snapshot
    const finished = rows.length
    return <div role="img" aria-label="Pascal triangle" style={{ display: 'grid', gap: 6, justifyItems: 'center' }}>
      {rows.map((values, r) => <div key={r} style={{ display: 'flex', gap: 4 }}>
        {values.map((value, c) => <span key={c} data-cell={`${r},${c}`} style={{
          minWidth: 34, height: 30, display: 'grid', placeItems: 'center', fontFamily: 'monospace', padding: '0 4px', boxSizing: 'border-box',
          border: '1px solid var(--border)', background: cell === c && row === r ? '#a5f3fc' : 'transparent',
        }}>{value}</span>)}
      </div>)}
      {row !== null && row >= finished && current && <div style={{ display: 'flex', gap: 4 }}>
        {current.map((value, c) => <span key={c} data-cell={`building,${c}`} style={{
          minWidth: 34, height: 30, display: 'grid', placeItems: 'center', fontFamily: 'monospace', padding: '0 4px', boxSizing: 'border-box',
          border: '2px dashed var(--text)', background: cell === c ? '#a5f3fc' : 'transparent',
        }}>{value}</span>)}
      </div>}
    </div>
  }} renderReasoning={() => <>
    <p><strong>Edges:</strong> the first and last entry of every row are 1.</p>
    <p><strong>Interior:</strong> each other entry is the sum of the two entries directly above it in the previous row.</p>
  </>} />
}
