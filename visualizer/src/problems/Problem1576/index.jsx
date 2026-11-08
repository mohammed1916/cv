import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1576',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'String of letters and ? marks (JSON string)',
  url: 'https://leetcode.com/problems/replace-all-s-to-avoid-consecutive-repeating-characters/',
  complexity: 'O(n) time: one left-to-right pass, and each ? checks at most two neighbours.',
  examples: [
    { label: 'Mixed', input: '"a?b??c"' },
    { label: 'All marks', input: '"???"' },
    { label: 'Between letters', input: '"ab?c?d"' },
    { label: 'Single mark', input: '"?"' },
    { label: 'Same letter around a mark', input: '"a?a"' },
    { label: 'Largest: 20 characters', input: '"?a?b?c?d?e?f?g?h?i?j"' },
    { label: 'Long run: 20 characters', input: '"bc?eded?cde??edbd??a"' },
  ],
}

const cell = (tone, active) => ({
  minWidth: 40, boxSizing: 'border-box', padding: '6px 8px', textAlign: 'center', fontFamily: 'monospace', color: 'var(--text)',
  background: tone ?? 'transparent',
  border: `${active ? 2 : 1}px solid ${active ? 'var(--text)' : 'var(--border)'}`,
})
const REPLACED = 'color-mix(in srgb, var(--success) 28%, transparent)'

export default function AvoidConsecutiveRepeats() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { index, chars } = step.snapshot
    const original = run.input
    const left = index !== null && index > 0 ? chars[index - 1] : null
    const right = index !== null && index + 1 < chars.length ? chars[index + 1] : null
    const current = index !== null && original[index] === '?'
    return <>
      <div role="img" aria-label="String positions" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {chars.map((ch, k) => <div key={k} style={{ display: 'grid', justifyItems: 'center', gap: 2 }}>
          <small style={{ minHeight: 16, color: 'var(--text-muted)' }}>{k === index ? 'i' : ''}</small>
          <div style={cell(original[k] === '?' && ch !== '?' ? REPLACED : undefined, k === index)}>{ch}<small> {k}</small></div>
        </div>)}
      </div>
      {current && <div aria-label="Letter choices" style={{ marginTop: 10 }}>
        <p>Choices for position {index}:</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {['a', 'b', 'c'].map(letter => {
            const blocked = letter === left || letter === right
            return <span key={letter} style={{ padding: '4px 10px', borderRadius: 6, fontFamily: 'monospace', border: '1px solid var(--border)',
              color: blocked ? 'var(--text-muted)' : 'var(--text)', textDecoration: blocked ? 'line-through' : 'none',
              background: !blocked && letter === chars[index] ? REPLACED : 'var(--surface2)' }}>
              {letter}{blocked ? ` (matches ${letter === left ? 'left' : 'right'})` : ''}
            </span>
          })}
        </div>
      </div>}
      <p>Green cells are former ? marks that are now filled. The outlined cell is the position being handled; i is its index.</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Greedy from the left:</strong> the left neighbour is already final, so each ? only has to differ from it and from its right neighbour as it stands.</p>
    <p><strong>Why three letters are enough:</strong> two neighbours block at most two letters, so one of a, b, c always remains.</p>
  </>} />
}
