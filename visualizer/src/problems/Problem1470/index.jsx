import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const tile = { minWidth: 44, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)', color: '#1c1917' }

const definition = {
  number: '1470',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and n (JSON)',
  url: 'https://leetcode.com/problems/shuffle-the-array/',
  complexity: 'O(n) time and O(n) space for the output list.',
  examples: [
    { label: 'Sample', input: '{"nums":[10,20,30,40],"n":2}' },
    { label: 'Six values', input: '{"nums":[9,1,8,2,7,3],"n":3}' },
    { label: 'One pair', input: '{"nums":[5,6],"n":1}' },
    { label: 'Repeated values', input: '{"nums":[7,7,7,7],"n":2}' },
    { label: 'Value limits', input: '{"nums":[1000,1,1,1000],"n":2}' },
    { label: 'Long run: 12 pairs', input: '{"nums":[34,998,989,669,895,844,15,73,473,964,636,774,878,63,121,218,652,775,532,919,741,295,262,909],"n":12}' },
  ],
}

export default function ShuffleTheArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums, n } = run.input
    const s = step.snapshot
    return <>
      <p>First half (x)</p>
      <div role="img" aria-label="First half" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {nums.slice(0, n).map((v, i) => <div key={i} style={{ ...tile, background: i === s.xIndex ? '#bbf7d0' : 'transparent' }}>{v}</div>)}
      </div>
      <p>Second half (y)</p>
      <div role="img" aria-label="Second half" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {nums.slice(n).map((v, i) => <div key={i} style={{ ...tile, background: n + i === s.yIndex ? '#fde68a' : 'transparent' }}>{v}</div>)}
      </div>
      <p>Output so far</p>
      <div role="img" aria-label="Output so far" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {s.result.map((v, i) => <div key={i} style={tile}>{v}</div>)}
      </div>
    </>
  }} renderReasoning={() => <>
    <p><strong>Pairs by position:</strong> the i-th x value and the i-th y value are adjacent in the output.</p>
    <p><strong>Two indices:</strong> position i reads x from index i and y from index n + i.</p>
  </>} />
}
