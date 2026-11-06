import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1528',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Letters and destination indices (JSON object)',
  url: 'https://leetcode.com/problems/shuffle-string/',
  complexity: 'O(n) time and O(n) space: one pass drops each letter into its slot.',
  examples: [
    { label: 'Scrambled word', input: '{"s":"harvest","indices":[2,0,5,6,1,3,4]}' },
    { label: 'Already in order', input: '{"s":"abc","indices":[0,1,2]}' },
    { label: 'Reversed', input: '{"s":"zyxw","indices":[3,2,1,0]}' },
  ],
}

export default function ShuffleString() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { s, indices, i, slots } = step.snapshot
    return <>
      <div role="img" aria-label="Letters in their original order" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {s.split('').map((ch, k) => <div key={k} style={{ width: 40, textAlign: 'center', fontFamily: 'monospace', border: `${k === i ? 2 : 1}px solid ${k === i ? 'var(--text)' : 'var(--border)'}`, padding: 4, boxSizing: 'border-box', background: k === i ? 'var(--surface2)' : 'transparent' }}>
          <div>{ch}</div><small>from {k}{k === i ? ' (i)' : ''}</small><br /><small>to {indices[k]}</small>
        </div>)}
      </div>
      <p>Slots by destination:</p>
      <div role="img" aria-label="Destination slots" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {slots.map((ch, k) => <div key={k} style={{ width: 40, textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)', padding: 4, boxSizing: 'border-box', background: ch ? 'var(--surface2)' : 'transparent', color: 'var(--text)' }}>
          <div>{ch ?? '·'}</div><small>{k}</small>
        </div>)}
      </div>
    </>
  }} renderReasoning={() => <>
    <p><strong>Direct placement:</strong> each letter already knows its destination, so it can be written there immediately.</p>
    <p><strong>Why no sorting:</strong> sorting would cost O(n log n); the index array is a permutation, so one write per letter is enough.</p>
  </>} />
}
