import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1689',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Positive whole number (digits only)',
  url: 'https://leetcode.com/problems/partitioning-into-minimum-number-of-deci-binary-numbers/',
  complexity: 'O(d) time for d digits and O(1) extra space.',
  examples: [
    { label: 'Mixed digits', input: '2046' },
    { label: 'Single digit', input: '5' },
    { label: 'Long run', input: '90000' },
  ],
}

const cell = (on, emphasis) => ({
  width: 28, height: 28, boxSizing: 'border-box', display: 'grid', placeItems: 'center', fontFamily: 'monospace', borderRadius: 4,
  border: `${emphasis ? 2 : 1}px solid ${emphasis ? 'var(--primary)' : 'var(--border)'}`,
  background: on ? 'var(--primary)' : 'var(--surface)', color: on ? 'var(--on-primary, var(--primary-contrast))' : 'var(--text-muted, var(--text))',
})

// Each column is one digit of n. Each row is one deci-binary number: a 1 is placed where the digit
// is at least the row's level. The number of rows that fill is the answer.
export default function DeciBinary() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { digits, index, best, layers } = step.snapshot
    const levels = best || 0
    const rows = layers ? layers.length : levels
    return <>
      <div role="img" aria-label="Digits of n" style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        {digits.split('').map((ch, i) => <div key={i} style={{ width: 28, textAlign: 'center', fontFamily: 'monospace', fontWeight: i === index ? 700 : 400, color: 'var(--text)' }}>
          {ch}<div style={{ height: 3, background: i === index ? 'var(--primary)' : 'transparent' }} />
        </div>)}
      </div>
      {rows > 0 && <div aria-label="Deci-binary layers" style={{ display: 'grid', gap: 4 }}>
        {Array.from({ length: rows }, (_, r) => {
          const level = rows - r
          return <div key={level} style={{ display: 'flex', gap: 6 }}>
            {digits.split('').map((ch, i) => <span key={i} style={cell(Number(ch) >= level, false)}>{Number(ch) >= level ? 1 : 0}</span>)}
            <span style={{ alignSelf: 'center', marginLeft: 6, fontFamily: 'monospace', fontSize: 13 }}>layer {r + 1}</span>
          </div>
        })}
      </div>}
      <p style={{ marginTop: 10 }}>Best digit so far: <strong>{best}</strong>{layers ? ` · ${layers.length} layers, each a deci-binary number` : ''}</p>
      {layers && <p style={{ fontFamily: 'monospace' }}>{layers.join(' + ')} = {digits}</p>}
    </>
  }} renderReasoning={({ run }) => <>
    <p><strong>Key idea:</strong> a deci-binary number has only 0 and 1 digits, so at each place value one of them contributes at most 1. Covering a digit d needs d such numbers.</p>
    <p><strong>Answer:</strong> the largest digit of {run.input}. The layers shown above add back up to the original number.</p>
  </>} />
}
