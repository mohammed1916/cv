import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1313',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Flat list of frequency and value pairs (JSON)',
  url: 'https://leetcode.com/problems/decompress-run-length-encoded-list/',
  complexity: 'O(n) time for the output of n values, and O(n) space for the output.',
  examples: [
    { label: 'Two pairs', input: '[2,5,1,7]' },
    { label: 'Three pairs', input: '[3,1,1,2,2,3]' },
    { label: 'Single value', input: '[4,9]' },
  ],
}

export default function Decompress() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { nums, pair, out } = step.snapshot
    return <>
      <div aria-label="Pairs" style={{ display: 'flex', gap: 8, fontFamily: 'monospace' }}>
        {Array.from({ length: nums.length / 2 }, (_, p) => {
          const active = pair === p * 2
          return <div key={p} style={{ border: `${active ? 2 : 1}px solid ${active ? 'var(--text)' : 'var(--border)'}`, padding: 6 }}>
            <div>freq {nums[p * 2]}</div><div>value {nums[p * 2 + 1]}</div>
          </div>
        })}
      </div>
      <div aria-label="Output" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 10, fontFamily: 'monospace' }}>
        {out.map((v, i) => <span key={i} style={{ padding: '2px 6px', border: '1px solid var(--border)' }}>{v}</span>)}
      </div>
    </>
  }} renderReasoning={() => <>
    <p><strong>Pairs:</strong> each pair is read as (count, value), so the output grows by exactly count items per pair.</p>
    <p><strong>Order:</strong> pairs are expanded from left to right, so the output keeps the original sequence.</p>
  </>} />
}
