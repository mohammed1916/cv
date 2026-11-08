import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Pending', description: 'The timer is running.' },
    { id: 'wait', label: 'Waiting', description: 'Nothing can read the value yet.' },
    { id: 'resolve', label: 'Resolve', description: 'The timer resolves the promise.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with value and ms',
  url: 'https://leetcode.com/problems/delay-the-resolution-of-each-promise/',
  complexity: 'O(1) work plus one timer of ms milliseconds.',
  examples: [
    { label: 'Short delay', input: '{"value":"ready","ms":40}' },
    { label: 'Number', input: '{"value":42,"ms":120}' },
    { label: "Null value at zero delay", input: "{\"value\":null,\"ms\":0}" },
    { label: "Nested array at zero delay", input: "{\"value\":[1,[2]],\"ms\":0}" },
    { label: "Object value after 60 ms", input: "{\"value\":{\"ok\":true},\"ms\":60}" },
    { label: "Long run: 1000 ms delay", input: "{\"value\":\"late\",\"ms\":1000}" },
  ],
}

export default function DelayPromiseResolution() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <section aria-label="Clock timeline">
      <h3>Clock</h3>
      <div style={{ position: 'relative', height: 28, borderRadius: 6, background: 'var(--surface2)', border: '1px solid var(--border, var(--surface2))' }}>
        <div style={{ position: 'absolute', inset: 0, width: `${step.ms ? (step.clock / step.ms) * 100 : 100}%`, background: 'var(--primary)', opacity: 0.35, borderRadius: 6 }} />
        <span style={{ position: 'absolute', left: 8, top: 4, color: 'var(--text)' }}>{`${step.clock} ms of ${step.ms} ms`}</span>
      </div>
      <p style={{ color: 'var(--text)' }}>{`Promise: ${step.state}`}</p>
    </section>
    <output aria-label="Delivered value">{step.state === 'resolved' ? `Delivered ${JSON.stringify(step.out[0])}` : 'Not delivered yet'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The wrapper does not change the value. It only moves the moment the value is delivered.</p>
  </>} />
}
