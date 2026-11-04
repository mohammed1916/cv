import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1647',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (JSON)',
  url: 'https://leetcode.com/problems/minimum-deletions-to-make-character-frequencies-unique/',
  complexity: 'O(n + k log k) time where k is the alphabet size: count letters, sort frequencies, then take the largest free value for each.',
  examples: [
    { label: 'Sample aaabbbcc', input: '{"s":"aaabbbcc"}' },
    { label: 'Already unique', input: '{"s":"aaabbc"}' },
    { label: 'Single letters', input: '{"s":"abcdef"}' },
  ],
}

export default function MinimumDeletionsUniqueFrequencies() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { freqs, index, count, target, kept, deletions } = step.snapshot
    return <>
      <div role="img" aria-label="Sorted frequencies" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {freqs.map((f, i) => <div key={i} data-index={i} style={{
          minWidth: 46, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
          border: `${i === index ? 2 : 1}px solid ${i === index ? 'var(--text)' : 'var(--border)'}`,
          background: i === index ? 'var(--surface2)' : 'transparent', color: 'var(--text)',
        }}><div>{f}</div><small>letter {i + 1}</small></div>)}
      </div>
      <section aria-label="Frequency values in use">
        <h4>Frequency values 1 to {freqs.length ? freqs[0] : 0}: filled means already kept</h4>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {Array.from({ length: freqs.length ? freqs[0] : 0 }, (_, k) => k + 1).map(value => {
            const isKept = kept.includes(value)
            const isTarget = target === value && count !== null
            return <span key={value} style={{ minWidth: 30, textAlign: 'center', padding: '4px 6px', borderRadius: 4, fontFamily: 'monospace', color: 'var(--text)',
              border: `${isTarget ? 2 : 1}px solid ${isTarget ? 'var(--primary)' : 'var(--border)'}`,
              background: isKept ? 'color-mix(in srgb, var(--success) 30%, transparent)' : 'transparent' }}>{value}</span>
          })}
        </div>
      </section>
      <p>{count === null ? 'Frequencies are sorted, largest first.' : `Current frequency ${count}, target ${target}.`}</p>
      <p>Kept values: {kept.length ? kept.join(', ') : 'none yet'}</p>
      <p>Deletions so far: <strong>{deletions}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Largest first:</strong> sorting from largest to smallest lets each letter take the highest positive value still free, which never blocks a later letter unnecessarily.</p>
    <p><strong>Zero is free:</strong> a letter lowered to zero disappears, so any number of letters can end at zero.</p>
  </>} />
}
