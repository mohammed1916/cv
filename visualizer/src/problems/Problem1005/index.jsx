import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1005',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and k (JSON)',
  url: 'https://leetcode.com/problems/maximize-sum-of-array-after-k-negations/',
  complexity: 'O(n log n) time for the sort, and O(n) space for the working copy.',
  examples: [
    { label: 'Flips then parity', input: '{"nums":[3,-7,-2,6],"k":3}' },
    { label: 'Odd leftover', input: '{"nums":[5,-1,2],"k":2}' },
    { label: 'Single negative', input: '{"nums":[-3],"k":2}' },
    { label: 'Single zero', input: '{"nums":[0],"k":1}' },
    { label: 'Equal even values', input: '{"nums":[2,2,2,2],"k":2}' },
    { label: 'Largest magnitudes, k at its limit', input: '{"nums":[100,-100,100,-100,100,-100,100,-100,100,-100,100,-100],"k":10}' },
    { label: 'Long run: 12 numbers', input: '{"nums":[10,85,54,19,88,-23,3,-8,44,-75,89,8],"k":7}' },
  ],
}

export default function MaximizeSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { values, flipped, remaining, sum, pointer } = step.snapshot
    return <>
      <IndexedSequence label="Sorted values" length={step.snapshot.values.length} valueAt={k => step.snapshot.values[k]} active={pointer} roleAt={k => (flipped.includes(k) ? 'flipped' : '')} />
      <div aria-label="Working values" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {values.map((v, i) => <div key={i} style={{
          minWidth: 48, textAlign: 'center', fontFamily: 'monospace', padding: '6px 8px', boxSizing: 'border-box', color: 'var(--text)',
          border: `${flipped.includes(i) ? 2 : 1}px solid ${flipped.includes(i) ? 'var(--text)' : 'var(--border)'}`,
          background: flipped.includes(i) ? 'var(--surface2)' : 'transparent',
        }}><div>{v}</div><small style={{ color: 'var(--primary)' }}>{pointer === i ? 'i' : flipped.includes(i) ? 'flipped' : ''}</small></div>)}
      </div>
      <p>{`Flips remaining: ${remaining}`}{sum !== null ? `, current sum: ${sum}` : ''}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Greedy choice:</strong> a flip gains twice the magnitude of a negative value, so flipping the most negative values first is best.</p>
    <p><strong>Parity:</strong> two flips on the same value cancel, so an odd leftover must still touch one value; the smallest magnitude costs least.</p>
  </>} />
}
