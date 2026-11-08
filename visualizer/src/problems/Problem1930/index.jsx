import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1930',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Lowercase string (e.g. abcaba)',
  url: 'https://leetcode.com/problems/unique-length-3-palindromic-subsequences/',
  complexity: 'O(26 n) time with a scan of the outer pair for each letter.',
  examples: [
    { label: 'Repeated outer letters', input: 'abcaba' },
    { label: 'Short', input: 'aabca' },
    { label: 'Single letter', input: 'a' },
    { label: 'Repeated letters', input: 'aaaa' },
    { label: 'Long run: 30 letters', input: 'hijsnmlarcvmxwhupiziludmdkhylw' },
  ],
}

export default function Problem1930Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <div aria-label="String with outer pair" style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {[...run.input.s].map((ch, i) => {
          const outer = i === step.first || i === step.last
          const inside = i > step.first && i < step.last
          return <span key={i} style={{
            width: 30, height: 36, display: 'grid', placeItems: 'center', fontFamily: 'monospace', borderRadius: 6,
            border: outer ? '2px solid var(--primary)' : '1px solid var(--border)',
            background: outer ? 'color-mix(in srgb, var(--primary) 20%, var(--surface2))' : inside && step.inside.includes(ch) ? 'color-mix(in srgb, var(--success, #16a34a) 20%, var(--surface2))' : 'var(--surface2)',
          }}>{ch}</span>
        })}
      </div>
      <p>Letter: <strong>{step.letter ?? '-'}</strong> · distinct letters between its outer pair: <strong>{step.inside.join(', ') || 'none'}</strong></p>
      <output aria-label="Total">Total so far: {step.total}</output>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
