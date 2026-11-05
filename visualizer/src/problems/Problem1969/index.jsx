import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1969',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Bit width p (1 to 5)',
  url: 'https://leetcode.com/problems/minimum-non-zero-product-of-the-array-elements/',
  complexity: 'O(2^p) to list the pairs for the visualization and O(p) multiplications for the power. The official bound is p up to 60.',
  examples: [
    { label: 'Two bits', input: '2' },
    { label: 'Three bits', input: '3' },
  ],
}

export default function Problem1969Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <div aria-label="Values 1 to top" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {step.values.map(v => {
          const partner = step.top - v
          const inPair = step.x !== null && (v === step.x || v === partner)
          const paired = step.x === null && v !== step.top
          return <span key={v} style={{ minWidth: 44, textAlign: 'center', padding: '6px 8px', borderRadius: 6, fontFamily: 'monospace', border: inPair ? '2px solid var(--primary)' : '1px solid var(--border)', background: v === step.top ? 'color-mix(in srgb, var(--success, #16a34a) 20%, var(--surface2))' : paired ? 'var(--surface2)' : 'var(--surface2)' }}>
            {v} <small style={{ color: 'var(--text-muted)' }}>{v.toString(2).padStart(run.input.p, '0')}</small>
          </span>
        })}
      </div>
      <p>The largest value {step.top} stays fixed. Each pair with sum {step.top} is made of two values whose bits are complementary.</p>
      <p>Pairs: <strong>{step.pairs}</strong> · value raised: <strong>{step.pairValue}</strong>{step.power !== undefined ? <> · power: <strong>{step.power}</strong></> : ''}</p>
      {step.result !== undefined && <output aria-label="Result">Result: {step.result}</output>}
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
