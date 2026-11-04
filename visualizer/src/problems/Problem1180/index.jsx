import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Lowercase letters (1 to 50)',
  url: 'https://leetcode.com/problems/count-substrings-with-only-one-distinct-letter/',
  complexity: 'O(n) time and O(1) extra space: one pass keeps the current run length and the running total.',
  examples: [
    { label: 'Mixed runs', input: 'aaabb' },
    { label: 'Distinct', input: 'abc' },
    { label: 'Long run', input: 'zzzzz' },
  ],
}

export default function CountSubstringsWithOneDistinctLetter() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { s, index, run, total } = step.snapshot
    const left = index === null ? null : index - run + 1
    return <>
      <div role="img" aria-label="Letters" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {[...s].map((ch, i) => {
          const inRun = index !== null && i >= left && i <= index
          const role = index === null ? '' : i === left && i === index ? 'l, r' : i === left ? 'l' : i === index ? 'r' : ''
          return <div key={i} data-index={i} style={{ display: 'grid', justifyItems: 'center', gap: 2 }}>
            <div style={{
              width: 36, height: 36, boxSizing: 'border-box', display: 'grid', placeItems: 'center', fontFamily: 'monospace',
              border: index === i ? '2px solid var(--text)' : '1px solid var(--border)',
              background: inRun ? 'color-mix(in srgb, var(--primary) 28%, transparent)' : 'var(--surface2)',
              color: 'var(--text)',
            }}>{ch}</div>
            <small style={{ color: 'var(--text-dim)', minHeight: '1em' }}>{role}</small>
          </div>
        })}
      </div>
      <output aria-label="Run state">{index === null ? `Total: ${total}` : `Index ${index} · run from l = ${left} to r = ${index}, length ${run} · total ${total}`}</output>
    </>
  }} renderReasoning={() => <>
    <p><strong>Count by end position:</strong> a run of equal letters ending at index i gives one uniform substring for each of its letters that can start it, so the count at i is the current run length.</p>
    <p><strong>Reset:</strong> a letter that differs from the one before it starts a new run of length 1. The run is the window from l to r.</p>
  </>} />
}
