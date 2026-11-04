import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1513',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Binary string of 0 and 1 characters',
  url: 'https://leetcode.com/problems/number-of-substrings-with-only-1s/',
  complexity: 'O(n) time and O(1) extra space: one pass keeps the current block length and the running total.',
  examples: [
    { label: 'Two blocks', input: '0110111' },
    { label: 'Single block', input: '111' },
    { label: 'No ones', input: '0000' },
  ],
}

export default function OnesSubstrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { index, run: block, total } = step.snapshot
    const chars = [...run.input.s]
    const hasBlock = index !== null && index !== undefined && block > 0
    const l = hasBlock ? index - block + 1 : -1
    const r = hasBlock ? index : -1
    return <>
      <section aria-label="Binary string">
        <h3>The block of ones runs from l to r</h3>
        <div role="img" aria-label="Binary string" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {chars.map((ch, i) => {
            const inBlock = hasBlock && i >= l && i <= r
            return <div key={i} data-index={i} style={{
              minWidth: 34, padding: '4px 6px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace', color: 'var(--text)',
              border: `${i === index ? 2 : 1}px solid ${i === index ? 'var(--text)' : 'var(--border)'}`,
              background: inBlock ? 'color-mix(in srgb, var(--success) 30%, var(--surface2))' : ch === '1' ? 'var(--surface2)' : 'transparent',
            }}>
              <div>{ch}</div>
              <small style={{ display: 'block', height: 14, fontWeight: 700, color: 'var(--text-muted)' }}>
                {i === l ? 'l' : ''}{i === r ? 'r' : ''}
              </small>
            </div>
          })}
        </div>
      </section>
      <p>Current block of ones: <strong>{block}</strong>{hasBlock ? ` (l = ${l}, r = ${r}), so ${block} substring${block === 1 ? '' : 's'} end at r` : ''} · Running total: <strong>{total}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Ending here:</strong> a block of length L contributes L substrings that end at the current 1, namely the ones that start at each position of the block.</p>
    <p><strong>Breaking the block:</strong> a 0 cannot be part of any all-ones substring, so the block length resets.</p>
  </>} />
}
