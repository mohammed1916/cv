import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1523',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with low and high (JSON)',
  url: 'https://leetcode.com/problems/count-odd-numbers-in-an-interval-range/',
  complexity: 'O(1) time and O(1) space: two floor divisions replace any loop over the interval.',
  examples: [
    { label: 'Mixed bounds', input: '{"low":3,"high":7}' },
    { label: 'Even low', input: '{"low":8,"high":10}' },
    { label: 'Wide range', input: '{"low":21,"high":40}' },
    { label: 'Single odd', input: '{"low":5,"high":5}' },
    { label: 'Single even', input: '{"low":4,"high":4}' },
    { label: 'Full bound', input: '{"low":0,"high":1000000000}' },
    { label: 'Long run: large range', input: '{"low":18082714,"high":269408728}' },
  ],
}

export default function OddInterval() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { low, high, upto, below, answer } = step.snapshot
    const short = high - low <= 20
    const values = []
    for (let x = low; x <= high && short; x++) values.push(x)
    return <>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <div><small>Odd integers 0 to high</small><div style={{ fontFamily: 'monospace' }}>{upto ?? '…'}</div></div>
        <div><small>Odd integers below low</small><div style={{ fontFamily: 'monospace' }}>{below ?? '…'}</div></div>
        <div><small>Answer</small><div style={{ fontFamily: 'monospace' }}>{answer ?? '…'}</div></div>
      </div>
      {short ? <div role="img" aria-label="Integers in the interval" style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
        {values.map(x => <div key={x} style={{
          minWidth: 30, padding: '4px 6px', textAlign: 'center', fontFamily: 'monospace', boxSizing: 'border-box',
          border: '1px solid var(--border)', background: x % 2 === 1 ? 'var(--surface2)' : 'transparent',
        }}>{x}</div>)}
      </div> : <p>The interval is too long to list. The formula uses only the two bounds.</p>}
      <p>Interval [{run.input.low}, {run.input.high}]</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Prefix trick:</strong> the odd integers in 0..n number (n + 1) // 2, so subtracting the count below low leaves the interval.</p>
    <p><strong>No loop:</strong> the bounds can reach 10^9, so the trace never enumerates the interval.</p>
  </>} />
}
