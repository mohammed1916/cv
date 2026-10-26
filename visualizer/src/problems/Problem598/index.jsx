import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Full matrix', description: 'Every cell starts at zero.' },
    { id: 'apply', label: 'Apply operation', description: 'Each block shrinks the maximum region to its minimum bounds.' },
    { id: 'done', label: 'Complete', description: 'Return the area of the maximum region.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Matrix and operations (JSON object)',
  url: 'https://leetcode.com/problems/range-addition-ii/',
  complexity: 'O(k) time for k operations and O(1) extra space. The matrix itself is never materialized.',
  examples: [
    { label: 'Two blocks', input: '{"m":3,"n":3,"ops":[[2,2],[3,3]]}' },
    { label: 'Empty ops', input: '{"m":3,"n":3,"ops":[]}' },
    { label: 'Single block', input: '{"m":5,"n":2,"ops":[[1,1]]}' },
  ],
}

export default function RangeAdditionII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const cells = Math.min(run.input.m, 12) * Math.min(run.input.n, 12)
    const cols = Math.min(run.input.n, 12)
    return <>
      <div aria-label="Matrix sketch" className="algorithm-grid__cells" style={{ gridTemplateColumns: `repeat(${cols}, 28px)`, display: 'grid', gap: 3 }}>
        {Array.from({ length: cells }, (_, k) => {
          const r = Math.floor(k / cols), c = k % cols
          const inMax = r < step.rows && c < step.cols
          return <div key={k} style={{ height: 28, borderRadius: 4, border: '1px solid var(--border)', background: inMax ? 'var(--primary)' : 'var(--surface2)', opacity: inMax ? 0.85 : 0.5 }} />
        })}
      </div>
      <p>Showing the top-left {Math.min(run.input.m, 12)}×{cols} corner; blue cells hold the maximum value.</p>
      <output aria-label="Max region">Max region: {step.rows} × {step.cols}</output>
    </>
  }} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Key idea:</strong> every operation increments a block anchored at (1,1), so only the cells inside every block reach the maximum. That intersection is the block with minimum row and column bounds.</p>
    <p>{run.input.ops.length ? `${run.input.ops.length} operations reduce ${run.input.m}×${run.input.n} to ${step.rows}×${step.cols}.` : 'No operations: every cell is maximal.'}</p>
  </>} />
}
