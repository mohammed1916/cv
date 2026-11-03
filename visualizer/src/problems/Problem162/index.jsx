import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '162',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of integers with no two equal neighbours',
  url: 'https://leetcode.com/problems/find-peak-element/',
  complexity: 'O(log n) time and O(1) space: each probe halves the window.',
  examples: [
    { label: 'Zigzag', input: '[1,5,3,7,2,0]' },
    { label: 'Falling start', input: '[9,4,2,7]' },
    { label: 'Single rise and fall', input: '[1,2,3,2,1]' },
  ],
}

export default function FindPeakVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums, lo, hi, mid, peak } = step.snapshot
    return <>
      <div role="img" aria-label="Array with search window" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        {nums.map((value, i) => {
          const inWindow = i >= lo && i <= hi
          const isPeak = peak === i
          return <div key={i} data-index={i} style={{ textAlign: 'center', fontFamily: 'monospace' }}>
            <div style={{
              minWidth: 40, padding: '4px 6px', boxSizing: 'border-box', color: '#1c1917',
              border: `${i === mid || isPeak ? 2 : 1}px solid ${i === mid ? 'var(--text)' : 'var(--border)'}`,
              background: isPeak ? '#bbf7d0' : inWindow ? 'var(--surface2)' : 'transparent',
              opacity: inWindow ? 1 : 0.4,
            }}>{value}</div>
            <small>{i === mid ? 'mid' : i === lo && i === hi ? 'lo=hi' : i === lo ? 'lo' : i === hi ? 'hi' : ''}</small>
          </div>
        })}
      </div>
      <p>{peak !== undefined && peak !== null ? `Peak at index ${peak}.` : `Window: indices ${lo} to ${hi}.`}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Climb toward the higher neighbour:</strong> if the value at mid is smaller than its right neighbour, some peak must lie to the right, because the values cannot keep rising forever past the end.</p>
    <p><strong>Keep the half with a peak:</strong> otherwise a peak exists at mid or to its left, so the right side is dropped.</p>
  </>} />
}
