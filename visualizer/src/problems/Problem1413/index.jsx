import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1413',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Step values (JSON array of integers)',
  url: 'https://leetcode.com/problems/minimum-value-to-get-positive-step-by-step-sum/',
  complexity: 'O(n) time and O(1) extra space: one pass keeps the running total and the lowest point.',
  examples: [
    { label: 'Dip to -4', input: '[-3,2,-3,4,2]' },
    { label: 'All positive', input: '[1,2,3]' },
    { label: 'One negative', input: '[-5]' },
  ],
}

export default function MinimumStartValue() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { values, index, total, lowest } = step.snapshot
    return <>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {values.map((v, i) => <div key={i} style={{
          padding: '6px 10px', borderRadius: 6, fontFamily: 'monospace',
          border: '2px solid', borderColor: i === index ? '#0891b2' : '#94a3b8',
          background: i === index ? '#cffafe' : undefined,
        }}>{v}</div>)}
      </div>
      <p>Running total: <strong>{total}</strong> · Lowest so far: <strong>{lowest}</strong></p>
      <p>Required start: {1 - lowest}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Only the lowest point matters.</strong> The start must lift the deepest running total up to at least 1.</p>
    <p><strong>The empty prefix is included.</strong> That keeps the answer at least 1 when every step is positive.</p>
  </>} />
}
