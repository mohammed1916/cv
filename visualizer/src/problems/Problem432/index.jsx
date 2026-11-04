import { Fragment } from 'react'
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import examples from '../../config/examples/all-o1-data-structure'
import { parseInput, buildTrace, code, python, pythonLineMap } from './algorithm'
const definition = {
  parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel: 'Operations as JSON arrays (up to 200 for visualization)',
  url: 'https://leetcode.com/problems/all-oone-data-structure/',
  complexity: 'Average O(1) per data-structure operation; rendering each snapshot costs O(number of keys).',
  examples: examples.map(e => ({ label: e.label, input: JSON.stringify(e.operations) })),
  phases: [{id:'start',label:'Initialize'}, {id:'operation',label:'Update or query'}, {id:'done',label:'Complete'}],
}
export default function AllOne() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({step}) => {
    // Group keys into count buckets, sorted by count: this is the chain the linked list holds.
    const buckets = new Map()
    for (const [key, count] of step.map || []) {
      if (!buckets.has(count)) buckets.set(count, [])
      buckets.get(count).push(key)
    }
    const chain = [...buckets].sort((a, b) => a[0] - b[0])
    const minCount = chain.length ? chain[0][0] : null
    const maxCount = chain.length ? chain[chain.length - 1][0] : null
    const cellStyle = active => ({
      minWidth: 90, padding: 8, boxSizing: 'border-box', color: 'var(--text)', textAlign: 'center',
      border: `${active ? 2 : 1}px solid ${active ? 'var(--text)' : 'var(--border)'}`,
      background: active ? 'var(--surface2)' : 'transparent',
    })
    return <>
      <p style={{ color: 'var(--text)' }}>Count buckets in order, from the head (lowest count) to the tail (highest count). Each key sits in the bucket for its count.</p>
      <div role="img" aria-label="Count bucket chain" style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={cellStyle(false)}><small>head</small><div>count 0</div></div>
        {chain.map(([count, keys]) => <Fragment key={count}>
          <span aria-hidden="true" style={{ color: 'var(--text)' }}>→</span>
          <div data-count={count} style={cellStyle(count === minCount || count === maxCount)}>
            <small>{count === minCount ? 'min bucket' : ''}{count === maxCount ? (count === minCount ? ' / max' : 'max bucket') : ''}</small>
            <div style={{ fontWeight: 700 }}>count {count}</div>
            <div style={{ fontFamily: 'monospace' }}>{keys.join(', ')}</div>
          </div>
        </Fragment>)}
        <span aria-hidden="true" style={{ color: 'var(--text)' }}>→</span>
        <div style={cellStyle(false)}><small>tail</small><div>sentinel</div></div>
      </div>
      <table aria-label="Current key counts" style={{ marginTop: 10, borderCollapse: 'collapse', color: 'var(--text)' }}>
        <thead><tr><th>Key</th><th>Count</th></tr></thead>
        <tbody>{[...(step.map || [])].map(([key,count])=><tr key={key} style={{ background: step.currentOp && step.currentOp.includes(`(${key})`) ? 'var(--surface2)' : 'transparent' }}><td>{key}</td><td>{count}</td></tr>)}</tbody>
      </table>
      {step.currentOp && <p style={{ color: 'var(--text)' }}>Operation: {step.currentOp}</p>}
      {Object.hasOwn(step, 'result') && <output>Query result: {JSON.stringify(step.result)}</output>}
      {!step.map?.size && <p style={{ color: 'var(--text)' }}>The data structure is empty.</p>}
    </>
  }} renderReasoning={() => <p>A map finds each key’s count bucket. Updates move it to an adjacent count bucket; empty buckets are unlinked. The first and last buckets supply extreme keys. Any tied key is valid.</p>} />
}
