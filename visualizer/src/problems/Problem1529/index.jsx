import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1529',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Target bit string (JSON string)',
  url: 'https://leetcode.com/problems/minimum-suffix-flips/',
  complexity: 'O(n) time and O(1) extra space: one scan that compares each bit with the current state.',
  examples: [
    { label: 'Mixed', input: '"011001"' },
    { label: 'Two changes', input: '"10"' },
    { label: 'Already zero', input: '"000"' },
    { label: 'Single bulb on', input: '"1"' },
    { label: 'Single bulb off', input: '"0"' },
    { label: 'Alternating start', input: '"0101"' },
    { label: 'Largest: 12 bulbs', input: '"101010101010"' },
    { label: 'Long run: 12 bulbs', input: '"101011010111"' },
  ],
}

export default function MinSuffixFlips() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { target, index, state, flips } = step.snapshot
    return <>
      <div role="img" aria-label="Target bits" style={{ display: 'flex', gap: 6 }}>
        {target.split('').map((bit, i) => <div key={i} style={{ width: 40, textAlign: 'center', fontFamily: 'monospace', padding: 6, boxSizing: 'border-box', border: `${i === index ? 2 : 1}px solid ${i === index ? 'var(--text)' : 'var(--border)'}`, background: i < (index ?? -1) ? 'var(--surface2)' : 'transparent' }}>
          <div>{bit}</div><small>{i}</small>
        </div>)}
      </div>
      <p>Current state of the string at this position: <strong>{state}</strong></p>
      <p>Flips placed: <strong>{flips}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Track one value:</strong> after some flips, the value at the current position is known. Only a change from that value needs a new flip.</p>
    <p><strong>Why it is minimal:</strong> every change between neighbouring target bits (starting from 0) forces a flip boundary there, and each flip creates at most one boundary.</p>
  </>} />
}
