import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2469',
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"celsius": 36.5}',
  url: 'https://leetcode.com/problems/convert-the-temperature/',
  complexity: 'O(1) time and O(1) space.',
  examples: [
    { label: 'Example 1', input: '{"celsius":36.5}' },
    { label: 'Freezing', input: '{"celsius":0}' },
    { label: 'Just above zero', input: '{"celsius":0.01}' },
    { label: 'Upper limit', input: '{"celsius":1000}' },
    { label: 'Boiling point', input: '{"celsius":100}' },
    { label: 'Fractional value', input: '{"celsius":136.3}' },
  ],
}

const fixed = value => (value === null ? '...' : value.toFixed(5))

// Two conversion chains share the same Celsius input. The highlighted row is the one the current step computes.
function Chain({ title, operation, result, active, done }) {
  return <section aria-label={title} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12, background: active ? 'var(--primary-glow)' : 'var(--surface2)', color: 'var(--text)' }}>
    <h3 style={{ margin: '0 0 6px', fontSize: '1rem' }}>{title}</h3>
    <p style={{ margin: 0, fontFamily: 'var(--font-mono, monospace)' }}>{operation}</p>
    <p style={{ margin: '6px 0 0', fontWeight: 700 }}>{done || active ? `= ${result}` : '= ...'}</p>
  </section>
}

export default function ConvertTheTemperature() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const c = run.input.celsius
    const kelvinActive = step.phase === 'kelvin'
    const fahrenheitActive = step.phase === 'fahrenheit'
    const done = step.phase === 'done'
    return <>
      <p className="algorithm-readout" aria-label="Celsius input">Celsius input: <strong>{c}</strong></p>
      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <Chain title="Kelvin chain" operation={`${c} + 273.15`} result={fixed(step.kelvin)} active={kelvinActive} done={done || step.kelvin !== null} />
        <Chain title="Fahrenheit chain" operation={`${c} × 1.80 + 32`} result={fixed(step.fahrenheit)} active={fahrenheitActive} done={done || step.fahrenheit !== null} />
      </div>
      <dl className="algorithm-readout" aria-label="Converted temperature">
        <dt>Kelvin</dt><dd>{fixed(step.kelvin)}</dd>
        <dt>Fahrenheit</dt><dd>{fixed(step.fahrenheit)}</dd>
      </dl>
      <p role="status">{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p>Kelvin is Celsius shifted by 273.15. Fahrenheit is Celsius multiplied by 1.80 and then shifted by 32.</p>
    <p>Each conversion is a single formula, so the answer is computed directly.</p>
  </>} />
}
