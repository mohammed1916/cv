import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1646',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n (JSON)',
  url: 'https://leetcode.com/problems/get-maximum-in-generated-array/',
  complexity: 'O(n) time and O(n) space: each index is computed once from smaller half indices.',
  examples: [
    { label: 'Sample n=9', input: '{"n":9}' },
    { label: 'Sample n=7', input: '{"n":7}' },
    { label: 'Single index', input: '{"n":0}' },
  ],
}

const cell = (active, half) => ({
  minWidth: 46, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
  border: `${active ? 2 : 1}px solid ${active ? 'var(--text)' : 'var(--border)'}`,
  background: half ? 'color-mix(in srgb, var(--warning) 28%, transparent)' : active ? 'var(--surface2)' : 'transparent', color: 'var(--text)',
})

export default function GetMaximumInGeneratedArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { values, index, half, value, best } = step.snapshot
    return <>
      <div role="img" aria-label="Generated values" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {values.map((v, i) => <div key={i} data-index={i} style={cell(i === index, i === half || (index % 2 === 1 && i === half + 1))}>
          <div>{v}</div><small>{i}</small>
        </div>)}
      </div>
      {index !== null && index !== undefined && index >= 2 && <p style={{ color: 'var(--text)' }}>
        {index % 2 === 0
          ? `Even rule: nums[${index}] = nums[${half}] = ${values[half]}.`
          : `Odd rule: nums[${index}] = nums[${half}] + nums[${half + 1}] = ${values[half]} + ${values[half + 1]} = ${values[half] + values[half + 1]}.`}
      </p>}
      <p>{index === null || index === undefined ? 'Positions are filled from left to right.'
        : `Position ${index}${half !== null && half !== undefined ? `, reading half index ${half}` : ''}${value !== null && value !== undefined ? `, value ${value}` : ''}.`}</p>
      <p>Largest value so far: <strong>{best}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Built in order:</strong> an even index copies its half, and an odd index sums the two values around its half, so every dependency is already filled.</p>
    <p><strong>Track the maximum:</strong> only the largest value written so far is needed, so no second pass is required.</p>
  </>} />
}
