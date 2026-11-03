import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { phases, parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Dominoes (JSON array of [a, b] pairs)',
  url: 'https://leetcode.com/problems/number-of-equivalent-domino-pairs/',
  complexity: 'O(n) expected time and O(n) space for n dominoes. The visualization caps n at 40.',
  examples: [
    { label: 'Turned copies', input: '[[1,2],[2,1],[3,4],[1,2]]' },
    { label: 'All equal', input: '[[4,4],[4,4],[4,4]]' },
    { label: 'No matches', input: '[[1,2],[3,4],[5,6]]' },
  ],
}

export default function EquivalentDominoPairs() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => {
      const s = step.snapshot
      return <div style={{ display: 'grid', gap: 12 }}>
        <div aria-label="Dominoes"><strong>Dominoes:</strong> {run.input.map((d, i) => <span key={i} style={{ marginRight: 8, fontWeight: i === s.index ? 700 : 400 }}>[{d[0]}, {d[1]}]</span>)}</div>
        {s.key && <p>Current key: <strong>{s.key}</strong>{s.matches !== null && ` · earlier matches: ${s.matches}`}</p>}
        <div aria-label="Counts"><strong>Seen keys:</strong> {s.counts.map(c => `${c.key}×${c.n}`).join('  ') || 'none'}</div>
        <p>Total pairs: <strong>{s.pairs}</strong></p>
      </div>
    }}
    renderReasoning={() => <p>Keys are stored as (smaller end, larger end), so a domino and its turned copy count as the same key.</p>} />
}
