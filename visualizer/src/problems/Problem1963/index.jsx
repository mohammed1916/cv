import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1963',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Even-length string of [ and ] (e.g. ][][)',
  url: 'https://leetcode.com/problems/minimum-number-of-swaps-to-make-the-string-balanced/',
  complexity: 'O(n) time and O(1) extra space: one scan with a running count.',
  examples: [
    { label: 'One swap', input: '][][' },
    { label: 'Two swaps', input: ']]][[[' },
    { label: 'Already balanced', input: '[]' },
    { label: 'Smallest swap', input: '][' },
    { label: 'Long run: 30 characters', input: '[[[[]]]][][][[[]]][]][[[]]]][[' },
  ],
}

export default function Problem1963Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <div aria-label="Brackets" style={{ display: 'flex', gap: 4 }}>
        {[...run.input.s].map((ch, i) => {
          const st = step.status[i]
          return <span key={i} style={{ width: 34, height: 40, display: 'grid', placeItems: 'center', fontFamily: 'monospace', fontSize: '1.2rem', borderRadius: 6, border: i === step.i ? '2px solid var(--primary)' : '1px solid var(--border)', background: st === 'unmatched' ? 'color-mix(in srgb, var(--danger, #dc2626) 18%, var(--surface2))' : st === 'matched' ? 'color-mix(in srgb, var(--success, #16a34a) 18%, var(--surface2))' : st === 'open' ? 'color-mix(in srgb, var(--primary) 12%, var(--surface2))' : 'var(--surface2)' }}>{ch}</span>
        })}
      </div>
      <p>Green: a ] matched an earlier [. Red: a ] with nothing open before it. Blue: a [ still waiting.</p>
      <output aria-label="Open and unmatched">Open: {step.open} · unmatched ]: {step.unmatched}</output>
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
