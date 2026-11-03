import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (JSON)',
  complexity: 'O(n) time and O(1) extra space: five counters are rebuilt for each length.',
  examples: [
    { label: 'Several generations', input: '{"n":12}' },
    { label: 'One letter', input: '{"n":1}' },
    { label: 'Two letters', input: '{"n":2}' },
    { label: 'Long length', input: '{"n":60}' },
  ],
}

const VOWELS = ['a', 'e', 'i', 'o', 'u']

export default function CountVowelsPermutation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => (
    <div aria-label="Vowel counts" style={{ display: 'grid', gap: 8, justifyItems: 'start' }}>
      <div style={{ fontFamily: 'monospace' }}>Length {step.snapshot.length}</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {VOWELS.map((v, i) => (
          <div key={v} data-vowel={v} style={{ width: 84, padding: 8, border: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ fontWeight: 700 }}>{v}</div>
            <div style={{ fontFamily: 'monospace' }}>{step.snapshot.counts[i]}</div>
          </div>
        ))}
      </div>
    </div>
  )} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
