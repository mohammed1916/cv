import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1922',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Length n (1 to 40)',
  url: 'https://leetcode.com/problems/count-good-numbers/',
  complexity: 'O(log n) multiplications for each power. The visualization caps n at 40 so the bits fit on screen.',
  examples: [
    { label: 'Length 1', input: '1' },
    { label: 'Length 4', input: '4' },
    { label: 'Length 2', input: '2' },
    { label: 'Odd length 33', input: '33' },
    { label: 'Largest length 40', input: '40' },
  ],
}

function Column({ title, step }) {
  return <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 10, background: 'var(--surface2)', minWidth: 180 }}>
    <strong>{title}</strong>
    <div>Exponent bits: <code>{step.bits || '-'}</code></div>
    <div>Result so far: <strong>{step.result ?? '-'}</strong></div>
  </div>
}

export default function Problem1922Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ step }) => <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Column title="5 for even positions" step={step.part === 'odd' || step.part === 'done' ? { bits: '', result: '' } : step} />
      <Column title="4 for odd positions" step={step.part === 'odd' ? step : step.part === 'done' ? { bits: '', result: '' } : { bits: '', result: '' }} />
      <div style={{ border: '2px solid var(--primary)', borderRadius: 8, padding: 10 }}>
        <strong>Remaining exponent</strong><div>{step.remaining ?? step.exponent ?? '-'}</div>
      </div>
    </div>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
