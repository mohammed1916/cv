import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1000',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with stones and k (JSON)',
  url: 'https://leetcode.com/problems/minimum-cost-to-merge-stones/',
  complexity: 'O(n^3 * k) time with interval DP over n piles of at most 8 in this view, and O(n^2 * k) space.',
  examples: [
    { label: 'Pairs', input: '{"stones":[1,2,3],"k":2}' },
    { label: 'Triples', input: '{"stones":[1,1,1,1,1],"k":3}' },
    { label: 'Impossible count', input: '{"stones":[4,1,1,6],"k":3}' },
    { label: 'Single stone', input: '{"stones":[5],"k":2}' },
    { label: 'Equal stones form groups', input: '{"stones":[3,3,3,3],"k":2}' },
    { label: 'Eight stones of the largest size', input: '{"stones":[100,100,100,100,100,100,100,100],"k":8}' },
    { label: 'Long run: 8 stones', input: '{"stones":[15,98,17,22,57,54,63,89],"k":3}' },
  ],
}

export default function MergeStones() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { stones } = run.input
    const { single, i: ci, j: cj, feasible } = step.snapshot
    const n = stones.length
    return <>
      <div aria-label="Pile values" style={{ display: 'flex', gap: 6, fontFamily: 'monospace' }}>
        {stones.map((v, idx) => <div key={idx} style={{ minWidth: 40, textAlign: 'center', border: '1px solid var(--border)', padding: 4, background: ci !== null && idx >= ci && idx <= cj ? 'var(--surface2)' : 'transparent', color: 'var(--text)' }}><div>{v}</div><small style={{ color: 'var(--primary)' }}>{ci === idx ? 'l' : cj === idx ? 'r' : ''}</small></div>)}
      </div>
      {!feasible ? <p>The pile count cannot be reduced to one pile with these groups.</p> : <table aria-label="Single-pile block costs" style={{ fontFamily: 'monospace', borderCollapse: 'collapse', marginTop: 8 }}>
        <thead><tr><th>from \ to</th>{Array.from({ length: n }, (_, j) => <th key={j}>{j}</th>)}</tr></thead>
        <tbody>{single.map((row, i) => <tr key={i}><th>{i}</th>{row.map((value, j) => {
          const active = i === ci && j === cj
          return <td key={j} data-block={`${i},${j}`} style={{ width: 40, textAlign: 'center', border: `${active ? 2 : 1}px solid ${active ? 'var(--text)' : 'var(--border)'}`, background: value === null ? 'transparent' : 'var(--surface2)', color: 'var(--text)' }}>{value === null ? '' : value}</td>
        })}</tr>)}</tbody>
      </table>}
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Pile count rule:</strong> each merge takes k piles and produces one, so the count drops by k - 1. A block can end as one pile only when its length minus one is divisible by k - 1.</p>
    <p><strong>Interval table:</strong> a block's single-pile cost is its best k-pile cost plus its total, because the final merge touches every stone in the block once.</p>
  </>} />
}
