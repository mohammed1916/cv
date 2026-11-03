import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '153',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Rotated sorted array of distinct integers (JSON array)',
  url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/',
  complexity: 'O(log n) time and O(1) extra space: each probe discards half of the window.',
  examples: [
    { label: 'Sample A', input: '[6,8,9,2,4]' },
    { label: 'Rotated by three', input: '[7,1,3,5]' },
    { label: 'Not rotated', input: '[1,2,3,4,5]' },
  ],
}

export default function FindMinRotated() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums, lo, hi, mid } = step.snapshot
    return <>
      <div role="img" aria-label="Array values with the search window" style={{ display: 'flex', gap: 6 }}>
        {nums.map((v, i) => {
          const inside = i >= lo && i <= hi
          return <div key={i} style={{ width: 52, textAlign: 'center', fontFamily: 'monospace', padding: 6, boxSizing: 'border-box',
            border: `${i === mid ? 2 : 1}px solid ${i === mid ? 'var(--text)' : 'var(--border)'}`,
            background: inside ? 'var(--surface2)' : 'transparent', opacity: inside ? 1 : 0.4 }}>
            <div>{v}</div><small>{i}</small>
            <div style={{ fontSize: 11 }}>{i === lo ? 'lo' : ''}{i === hi ? ' hi' : ''}{i === mid ? ' mid' : ''}</div>
          </div>
        })}
      </div>
      <p>Window: positions {lo} to {hi}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Compare with the right end:</strong> the right end is always in the sorted tail of the rotation, so a middle value larger than it means the drop is to the right.</p>
    <p><strong>Why keep the middle:</strong> when the middle is not larger than the right end, the minimum can be the middle itself, so the right bound moves to it rather than past it.</p>
  </>} />
}
