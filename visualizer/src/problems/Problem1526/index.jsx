import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1526',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Target heights (JSON array of integers)',
  url: 'https://leetcode.com/problems/minimum-number-of-increments-on-subarrays-to-form-a-target-array/',
  complexity: 'O(n) time and O(1) extra space: one pass comparing each height with the one before it.',
  examples: [
    { label: 'Mixed rises', input: '[3,1,2,5,1]' },
    { label: 'Plateau', input: '[0,4,4,0,2]' },
    { label: 'Rising', input: '[1,2,3]' },
  ],
}

export default function MinIncrements() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { heights, index, previous } = step.snapshot
    const max = Math.max(1, ...heights)
    return <>
      <div role="img" aria-label="Target heights as columns" style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 180 }}>
        {heights.map((h, i) => <div key={i} data-index={i} style={{ width: 44, textAlign: 'center', fontFamily: 'monospace' }}>
          <div style={{ height: `${(h / max) * 140}px`, background: i === index ? '#0891b2' : i < (index ?? -1) ? '#a5f3fc' : 'var(--surface2)', border: '1px solid var(--border)', boxSizing: 'border-box' }} />
          <div>{h}</div><small>{i}</small>
        </div>)}
      </div>
      <p>{index === null ? 'Starting line at height 0.' : `Previous height ${previous}, current height ${heights[index]}.`}</p>
      <p>Running total: <strong>{step.snapshot.total}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Layer view:</strong> each operation adds one layer to a stretch of the line, so a rise of r above the previous height must start r new layers.</p>
    <p><strong>Why drops cost nothing:</strong> when a height falls or stays level, the layers already placed can simply stop earlier, so only rises are paid for.</p>
  </>} />
}
