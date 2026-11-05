import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1981',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Matrix and target (JSON)',
  url: 'https://leetcode.com/problems/minimize-the-difference-between-target-and-chosen-elements/',
  complexity: 'O(m * s * n) time, where s is the number of distinct reachable sums (at most 4900 here); O(s) space.',
  examples: [
    { label: 'Two rows', input: '{"mat":[[2,4],[3,1]],"target":6}' },
    { label: 'Three rows', input: '{"mat":[[5,7],[1,2],[4,6]],"target":9}' },
    { label: 'Single row', input: '{"mat":[[3,8,11]],"target":10}' },
  ],
}

export default function MinimizeTheDifference() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { mat, target, row, sums } = step.snapshot
    const shown = sums.slice(0, 60)
    return <>
      <div role="list" aria-label="Rows of choices" style={{ display: 'grid', gap: 4 }}>
        {mat.map((values, r) => <div key={r} role="listitem" style={{
          fontFamily: 'monospace', padding: '4px 6px',
          border: `${r === row ? 2 : 1}px solid ${r === row ? 'var(--primary)' : 'var(--border)'}`,
          color: 'var(--text)',
        }}>Row {r}: {values.join(' · ')}</div>)}
      </div>
      <p>Reachable sums after row {row}: <strong>{sums.length}</strong> distinct totals.</p>
      <div aria-label="Reachable sums" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {shown.map(total => <span key={total} style={{
          border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px',
          color: 'var(--text)', background: Math.abs(total - target) === 0 ? 'var(--primary-glow)' : 'var(--surface2)',
        }}>{total}</span>)}
      </div>
      {sums.length > shown.length && <p>{sums.length - shown.length} more sums are not drawn.</p>}
      <p>Target <strong>{target}</strong>: the highlighted sum is an exact hit.</p>
    </>
  }} renderReasoning={() => <p>Each row contributes one value, so the set of reachable totals is built row by row. The answer is the closest reachable total to the target.</p>} />
}
