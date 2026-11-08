import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1653',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (JSON)',
  url: 'https://leetcode.com/problems/minimum-deletions-to-make-string-balanced/',
  complexity: 'O(n) time and O(1) space: one scan keeps the cheapest balanced cost and the count of earlier b characters.',
  examples: [
    { label: 'Mixed string', input: '{"s":"abbaabb"}' },
    { label: 'Starts with b', input: '{"s":"bbaa"}' },
    { label: 'Already balanced', input: '{"s":"aabb"}' },
    { label: 'One letter', input: '{"s":"a"}' },
    { label: 'Equal runs', input: '{"s":"aabb"}' },
    { label: 'Longest allowed: alternating', input: '{"s":"abababababababababababababababababababababababababababababab"}' },
    { label: 'Long run: 60 letters', input: '{"s":"abbabbaababbbbabababaaabbabaaaababaabbababaabbaaabbababaabbb"}' },
  ],
}

// Replays the same rule for every prefix, so each column shows the running cheapest cost after that character.
function prefixCosts(s) {
  let deleted = 0
  let bCount = 0
  return [...s].map(ch => {
    if (ch === 'b') bCount += 1
    else deleted = Math.min(deleted + 1, bCount)
    return deleted
  })
}

export default function MinimumDeletionsBalancedString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { s, index, char, bCount, deleted, choice } = step.snapshot
    const costs = prefixCosts(run.input.s)
    return <>
      <div role="img" aria-label="String characters" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[...s].map((c, i) => <div key={i} data-index={i} style={{ display: 'grid', justifyItems: 'center', gap: 2 }}>
          <small style={{ minHeight: 16, color: 'var(--text)', fontWeight: 700 }}>{i === index ? 'i' : ''}</small>
          <div style={{
            minWidth: 40, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
            border: `${i === index ? 2 : 1}px solid ${i === index ? 'var(--text)' : 'var(--border)'}`,
            background: index >= 0 && i <= index ? 'var(--surface2)' : 'transparent', color: 'var(--text)',
          }}><div>{c}</div><small>{i}</small></div>
          <div style={{ fontFamily: 'monospace', color: index >= 0 && i <= index ? 'var(--primary)' : 'var(--text-muted)' }}>{index >= 0 && i <= index ? costs[i] : '·'}</div>
        </div>)}
      </div>
      <p style={{ color: 'var(--text-muted)' }}>Bottom row: the cheapest deletion count after reading each character.</p>
      <p style={{ color: 'var(--text)' }}>{char ? `Reading ${char}${choice ? `: ${choice}` : ''}.` : 'No character is being read.'}</p>
      <p style={{ color: 'var(--text)' }}>Earlier b characters: {bCount} · Cheapest deletions so far: <strong>{deleted}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Two choices for each a:</strong> delete this a, or delete every earlier b so that all remaining a characters come first.</p>
    <p><strong>One running minimum:</strong> the cheapest cost for the prefix is enough; no full table is needed.</p>
  </>} />
}
