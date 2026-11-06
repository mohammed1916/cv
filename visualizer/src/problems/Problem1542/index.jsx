import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1542', phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Digit string',
  url: 'https://leetcode.com/problems/find-longest-awesome-substring/',
  complexity: 'O(n * 10) time and O(n) space: one pass, with eleven mask lookups per position.',
  examples: [
    { label: 'Palindrome core', input: '1221' },
    { label: 'Mixed digits', input: '2024' },
    { label: 'All distinct', input: '0123' },
  ],
}

export default function AwesomeSubstring() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const s = run.input
    const { r, mask, best, span, hits = [] } = step.snapshot
    const [from, to] = span
    return <>
      <div role="img" aria-label="Digits with best span" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[...s].map((ch, i) => {
          const inBest = i >= from && i < to
          return <div key={i} data-index={i} style={{
            minWidth: 36, padding: '6px 8px', textAlign: 'center', fontFamily: 'monospace', color: 'var(--text)',
            border: `${i === r - 1 ? 2 : 1}px solid ${i === r - 1 ? 'var(--text)' : 'var(--border)'}`,
            background: inBest ? 'var(--surface2)' : 'transparent',
          }}><div>{ch}</div><small>{i}</small><div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', minHeight: 14 }}>{[i === r - 1 && 'r', i === from && span[0] !== span[1] && 'l'].filter(Boolean).join(' ')}</div></div>
        })}
      </div>
      <p>{`Prefix mask: ${(mask ?? 0).toString(2).padStart(10, '0')}. Best length so far: ${best}.`}</p>
      <ul>{hits.length
        ? hits.map(h => <li key={h.target}>{`Earlier prefix at ${h.start} gives length ${h.length}.`}</li>)
        : <li>No matching earlier prefix at this step.</li>}</ul>
    </>
  }} renderReasoning={() => <>
    <p><strong>Parity masks:</strong> a substring has at most one odd digit count exactly when its two prefix masks differ in at most one bit.</p>
    <p><strong>Earliest occurrence:</strong> keep the first index of each mask, so each lookup gives the longest substring that ends here.</p>
  </>} />
}
