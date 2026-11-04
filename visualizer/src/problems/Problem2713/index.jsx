import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import * as model from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Every cell begins a path of length 1.' },
    { id: 'cell', label: 'Cell', description: 'Set one cell from the best smaller value in its row or column.' },
    { id: 'group', label: 'Group', description: 'Equal values are finished, then their row and column bests are updated.' },
    { id: 'done', label: 'Result', description: 'The longest strictly increasing path.' },
  ],
  parse: model.parseInput, build: model.buildTrace, code: model.code, python: model.python,
  inputLabel: 'JSON matrix of integers (rectangular, at most 6 by 6)',
  url: 'https://leetcode.com/problems/maximum-strictly-increasing-cells-in-a-matrix/',
  complexity: 'O(mn log(mn)) to sort the cells. The visualization caps the matrix at 6 by 6.',
  examples: [
    { label: 'Mixed', input: '[[3,1,6],[-9,5,7]]' },
    { label: 'Equal neighbours', input: '[[1,1],[1,2]]' },
  ],
}

const cellStyle = (active, filled) => ({
  minWidth: 52, padding: '6px 4px', textAlign: 'center', borderRadius: 4,
  border: active ? '2px solid var(--primary)' : '1px solid var(--border)',
  background: filled ? 'var(--primary-glow)' : 'var(--surface)', color: 'var(--text)',
})

export default function MaxIncreasingCells() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const mat = run.input
    const m = mat.length, n = mat[0].length
    const table = step.table ?? []
    return <section aria-label="Matrix and path lengths" style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        <div>
          <h3 style={{ margin: '0 0 6px', color: 'var(--text)' }}>Values</h3>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, auto)`, gap: 4 }}>
            {mat.flatMap((row, r) => row.map((v, c) => <div key={`${r}-${c}`} style={cellStyle(step.r === r && step.c === c, false)}>{v}</div>))}
          </div>
        </div>
        <div>
          <h3 style={{ margin: '0 0 6px', color: 'var(--text)' }}>Longest path ending here</h3>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, auto)`, gap: 4 }}>
            {Array.from({ length: m }, (_, r) => Array.from({ length: n }, (_, c) => {
              const value = table[r]?.[c] ?? 0
              return <div key={`${r}-${c}`} data-role={value ? 'set' : 'unset'} style={cellStyle(step.r === r && step.c === c, value > 0)}>{value || '·'}</div>
            }))}
          </div>
        </div>
      </div>
      <p style={{ margin: 0, color: 'var(--text)' }}>{step.message}</p>
    </section>
  }} renderReasoning={() => <>
    <p>A path may jump to any cell in the same row or column, so the best smaller value in each row and each column is all a cell needs.</p>
    <p>Cells with the same value cannot follow each other, so a whole group of equal values is finished before the row and column bests are raised.</p>
  </>} />
}
