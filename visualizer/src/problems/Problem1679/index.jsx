import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and k (JSON)',
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity: 'O(n) expected time and O(n) space: one pass with counts of numbers still waiting for a partner.',
  examples: [
    { label: 'Mixed', input: '{"nums":[1,1,2,4,5,7],"k":8}' },
    { label: 'Repeated pairs', input: '{"nums":[3,1,3,1,3,1],"k":4}' },
    { label: 'No partners', input: '{"nums":[2,2,9],"k":5}' },
  ],
}

export default function MaxKSumPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { index, value, need, pairs, counts } = step.snapshot
    return <>
      <div role="img" aria-label="Numbers in order" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {run.input.nums.map((v, i) => <div key={i} data-index={i} style={{
          minWidth: 48, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
          border: `${i === index ? 2 : 1}px solid ${i === index ? 'var(--text)' : 'var(--border)'}`,
          background: i < (index ?? -1) || (index === null && step.phase === 'done') ? 'var(--surface2)' : 'transparent',
        }}><div>{v}</div><small>{i}</small></div>)}
      </div>
      <p>{need === null ? `Target sum is ${run.input.k}.` : `Current value ${value} needs a partner of ${need}.`}</p>
      <table aria-label="Waiting numbers" style={{ fontFamily: 'monospace', borderCollapse: 'collapse' }}>
        <thead><tr><th>waiting value</th><th>count</th></tr></thead>
        <tbody>{counts.length === 0 ? <tr><td colSpan={2}>nothing waiting</td></tr>
          : counts.map(entry => <tr key={entry.value}><td>{entry.value}</td><td>{entry.count}</td></tr>)}</tbody>
      </table>
      <output aria-label="Operations so far">Operations: {pairs}</output>
    </>
  }} renderReasoning={() => <>
    <p><strong>Pair on arrival:</strong> a value can only pair with a partner that is already waiting, so the scan decides each number once.</p>
    <p><strong>Why counts are enough:</strong> the order of pairing does not change how many pairs exist, so a map of waiting counts answers every lookup.</p>
  </>} />
}
