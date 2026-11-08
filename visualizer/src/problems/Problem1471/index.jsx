import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1471',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with arr (integers) and k',
  url: 'https://leetcode.com/problems/the-k-strongest-values-in-an-array/',
  complexity: 'O(n log n) time for the sort and the ranking. O(n) extra space for the sorted copy and the ranking.',
  examples: [
    { label: 'Spread out', input: '{"arr":[1,2,3,4,5],"k":2}' },
    { label: 'Negative tie', input: '{"arr":[-7,4,4,10,0],"k":3}' },
    { label: 'Even length', input: '{"arr":[1,2,3,4],"k":2}' },
    { label: 'Single element', input: '{"arr":[4],"k":1}' },
    { label: 'Repeated values', input: '{"arr":[3,3,3,3],"k":2}' },
    { label: 'Value limits', input: '{"arr":[-1000,1000,-1000,1000],"k":3}' },
    { label: 'Long run: 40 values', input: '{"arr":[-934,-835,179,120,726,-933,59,-59,470,414,450,-333,-80,745,425,459,57,539,-485,771,-925,442,-678,122,-686,-170,-415,-802,937,25,-572,885,480,-185,355,546,454,251,-138,459],"k":15}' },
  ],
}

import IndexedSequence from '../../components/shared/IndexedSequence'

const chip = { minWidth: 46, padding: '4px 6px', textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', background: 'var(--surface2)' }

export default function StrongestValues() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { k, arr } = { k: run.input.k, arr: run.input.arr }
    const { sorted = [], median, medianIndex, ranked = [], chosen = [] } = step.snapshot
    const hasSorted = sorted.length > 0
    return <>
      {hasSorted && <IndexedSequence label="Sorted values; the lower median is the middle element" length={sorted.length}
        active={medianIndex ?? -1} valueAt={i => sorted[i]}
        roleAt={i => (i === medianIndex ? 'median' : '')} />}
      {median !== null && median !== undefined && <p style={{ color: 'var(--text)' }}>
        Median = sorted[{medianIndex}] = <strong>{median}</strong>. Strength of a value = its distance from the median; ties go to the larger value.
      </p>}
      {ranked.length > 0 && <div style={{ marginBottom: 8 }}>
        <small style={{ color: 'var(--text)' }}>Ranked by strength (largest distance first)</small>
        <div role="list" aria-label="Ranked values" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {ranked.map((item, i) => <span key={i} role="listitem" style={{
            ...chip, borderWidth: chosen.includes(item.value) ? 2 : 1, borderColor: chosen.includes(item.value) ? 'var(--primary)' : 'var(--border)',
            opacity: chosen.length && !chosen.includes(item.value) && i >= k ? 0.4 : 1,
          }}>{item.value}<br /><small>|{item.value}-{median}| = {item.distance}</small></span>)}
        </div>
      </div>}
      <p style={{ color: 'var(--text)' }}>Chosen so far: [{chosen.join(', ')}] · input size {arr.length}, k = {k}</p>
      <p style={{ color: 'var(--text)' }}>{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Median first:</strong> the strength of each value depends only on its distance from the middle of the sorted list.</p>
    <p><strong>Ties:</strong> two values at the same distance are ordered by the larger value, so the answer is unique.</p>
  </>} />
}
