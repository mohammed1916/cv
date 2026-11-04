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

import IndexedSequence from '../../components/shared/IndexedSequence'

const cell = { minWidth: 48, padding: '4px 6px', textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', background: 'var(--surface2)' }

export default function MinStartValue() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const nums = run.input
    const { index, total, lowest } = step.snapshot
    const start = 1 - lowest
    const finished = index === null || index === undefined
    const upto = finished ? -1 : index
    const roleAt = i => (i === lowest && false ? 'low' : '')
    return <>
      <IndexedSequence label="Steps" length={nums.length} active={index ?? -1} valueAt={i => nums[i]} roleAt={roleAt} />
      <div role="img" aria-label="Running path from the chosen start" style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
        <span style={cell}>start<br />{start}</span>
        {nums.slice(0, Math.max(0, upto + 1)).map((_, i) => {
          const value = start + nums.slice(0, i + 1).reduce((s, v) => s + v, 0)
          return <span key={i} style={{ ...cell, borderColor: value < 1 ? '#b91c1c' : 'var(--border)', borderWidth: value < 1 ? 2 : 1 }}>{value}<br /><small>after {i + 1}</small></span>
        })}
      </div>
      <p style={{ color: 'var(--text)' }}>Running total: <strong>{total}</strong> · lowest prefix so far: <strong>{lowest}</strong> · required start 1 - {lowest} = <strong>{start}</strong></p>
      <p style={{ color: 'var(--text)' }}>{step.message}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Lowest point:</strong> the start must lift the lowest running total up to exactly 1, so the answer is 1 minus the lowest prefix sum.</p>
    <p><strong>Zero counts:</strong> the empty prefix (0) is included, so the start is never below 1.</p>
  </>} />
}
