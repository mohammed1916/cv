import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1946',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with num (digits) and change (ten digits 0 to 9)',
  url: 'https://leetcode.com/problems/largest-number-after-mutating-substring/',
  complexity: 'O(n) time: one scan to find the start and one pass over the block.',
  examples: [
    { label: 'Raise a block', input: '{"num":"132","change":[9,8,5,0,3,6,4,2,6,8]}' },
    { label: 'No raise possible', input: '{"num":"021","change":[0,1,2,3,4,5,6,7,8,9]}' },
    { label: 'Single digit', input: '{"num":"9","change":[0,1,2,3,4,5,6,7,8,9]}' },
    { label: 'Repeated digits', input: '{"num":"555","change":[0,1,2,3,4,5,6,7,8,9]}' },
    { label: 'Long run: twelve digits', input: '{"num":"343012567830","change":[7,0,7,8,7,4,5,2,5,8]}' },
  ],
}

export default function Problem1946Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <div aria-label="Digits" style={{ display: 'flex', gap: 6 }}>
        {step.digits.map((d, i) => {
          const inBlock = step.start >= 0 && i >= step.start && step.mutated.includes(i)
          const current = i === step.i
          return <div key={i} style={{ width: 44, textAlign: 'center', borderRadius: 6, padding: '6px 0', border: current ? '2px solid var(--primary)' : '1px solid var(--border)', background: inBlock ? 'color-mix(in srgb, var(--success, #16a34a) 22%, var(--surface2))' : 'var(--surface2)' }}>
            <div style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>{run.input.num[i]} → {run.input.change[Number(run.input.num[i])]}</div>
            <strong style={{ fontSize: '1.2rem' }}>{d}</strong>
          </div>
        })}
      </div>
      <p>Mapping row shows each digit and its image. Green digits were mutated.</p>
      {step.result !== null && <output aria-label="Result">Result: {step.result}</output>}
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
