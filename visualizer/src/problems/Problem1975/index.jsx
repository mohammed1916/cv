import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1975',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON square matrix (e.g. [[3,-1,2],[-4,5,0],[1,-2,6]])',
  url: 'https://leetcode.com/problems/maximum-matrix-sum/',
  complexity: 'O(n²) time to scan the matrix and O(1) extra space.',
  examples: [
    { label: 'Three negatives', input: '[[3,-1,2],[-4,5,0],[1,-2,6]]' },
    { label: 'Two negatives', input: '[[2,-3],[-5,4]]' },
  ],
}

export default function Problem1975Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <div aria-label="Matrix" style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${run.input.matrix.length}, 56px)`, gap: 4 }}>
        {run.input.matrix.flatMap((row, r) => row.map((v, c) => {
          const current = step.cell && step.cell[0] === r && step.cell[1] === c
          const small = step.smallestAt && step.smallestAt[0] === r && step.smallestAt[1] === c
          return <div key={`${r}-${c}`} style={{ height: 48, display: 'grid', placeItems: 'center', borderRadius: 6, border: current ? '2px solid var(--primary)' : '1px solid var(--border)', background: small ? 'color-mix(in srgb, var(--primary) 22%, var(--surface2))' : v < 0 ? 'color-mix(in srgb, var(--danger, #dc2626) 14%, var(--surface2))' : 'var(--surface2)', color: 'var(--text)' }}>{v}</div>
        }))}
      </div>
      <p>Total of absolute values: <strong>{step.total}</strong> · negatives: <strong>{step.negatives}</strong> · smallest magnitude: <strong>{step.smallest === Infinity ? '-' : step.smallest}</strong></p>
      <p>Highlighted cell: smallest magnitude so far.</p>
      {step.result !== undefined && <output aria-label="Result">Maximum sum: {step.result}</output>}
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
