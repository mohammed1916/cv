import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1653',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with s (JSON)',
  url: 'https://leetcode.com/problems/minimum-deletions-to-make-string-balanced/',
  complexity: 'O(n) time and O(1) space: one scan keeps the cheapest balanced cost and the count of earlier b characters.',
  examples: [
    { label: 'Mixed string', input: '{"s":"aababbab"}' },
    { label: 'Starts with b', input: '{"s":"bbaa"}' },
    { label: 'Already balanced', input: '{"s":"aabb"}' },
  ],
}

export default function MinimumDeletionsBalancedString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { s, index, char, bCount, deleted, choice } = step.snapshot
    return <>
      <div role="img" aria-label="String characters" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[...s].map((c, i) => <div key={i} data-index={i} style={{
          minWidth: 36, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
          border: `${i === index ? 2 : 1}px solid ${i === index ? 'var(--text)' : 'var(--border)'}`,
          background: i === index ? 'var(--surface2)' : 'transparent', color: 'var(--text)',
        }}><div>{c}</div><small>{i}</small></div>)}
      </div>
      <p>{char ? `Reading ${char}${choice ? `: ${choice}` : ''}.` : 'No character is being read.'}</p>
      <p>Earlier b characters: {bCount} · Cheapest deletions so far: <strong>{deleted}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Two choices for each a:</strong> delete this a, or delete every earlier b so that all remaining a characters come first.</p>
    <p><strong>One running minimum:</strong> the cheapest cost for the prefix is enough; no full table is needed.</p>
  </>} />
}
