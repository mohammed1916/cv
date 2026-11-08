import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1960',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Lowercase string (e.g. abcbaxyzy)',
  url: 'https://leetcode.com/problems/maximum-product-of-the-length-of-two-palindromic-substrings/',
  complexity: 'O(n²) time in the worst case from expanding every centre, with O(n) arrays. The visualization caps the string at 14 letters.',
  examples: [
    { label: 'Two palindromes', input: 'abcbaxyzy' },
    { label: 'Repeated letters', input: 'aaaa' },
    { label: 'Two letters', input: 'ab' },
    { label: 'Longest repeated letters', input: 'aaaaaaaaaaaaaa' },
    { label: 'Long run: 14 letters', input: 'rwfwjchmlihkjg' },
  ],
}

export default function Problem1960Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => <>
      <div aria-label="String with expansion pointers" style={{ display: 'flex', gap: 3 }}>
        {[...run.input.s].map((ch, i) => {
          const inside = step.l >= 0 && i >= step.l && i <= step.r
          const isL = i === step.l, isR = i === step.r
          return <div key={i} style={{ width: 30, textAlign: 'center' }}>
            <div style={{ fontSize: '.7rem', height: 14, color: 'var(--primary)' }}>{isL && isR ? 'l·r' : isL ? 'l' : isR ? 'r' : ''}</div>
            <span style={{ display: 'block', padding: '4px 0', fontFamily: 'monospace', borderRadius: 6, border: isL || isR ? '2px solid var(--primary)' : '1px solid var(--border)', background: inside ? 'color-mix(in srgb, var(--primary) 18%, var(--surface2))' : 'var(--surface2)' }}>{ch}</span>
          </div>
        })}
      </div>
      <p>Pointers l and r expand from a centre while the outer letters match. The shaded span is the palindrome being recorded.</p>
      {step.split !== null && <output aria-label="Split product">Product at split {step.split}: {step.product}</output>}
      {step.ans !== undefined && <output aria-label="Best product"> Best so far: {step.ans}</output>}
    </>}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
