import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1561',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with piles (JSON)',
  url: 'https://leetcode.com/problems/maximum-number-of-coins-you-can-get/',
  complexity: 'O(n log n) time for the sort and O(n) space for the sorted copy; the rounds then read every third pile.',
  examples: [
    { label: 'Six piles', input: '{"piles":[9,1,5,3,8,2]}' },
    { label: 'Repeated values', input: '{"piles":[2,4,1,2,7,8]}' },
    { label: 'Equal piles', input: '{"piles":[1,1,1]}' },
  ],
}

export default function MaximumCoins() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { ordered, triple, coins, round } = step.snapshot
    const active = new Set(triple ?? [])
    const taken = new Set(Array.from({ length: 3 * (round + 1) }, (_, i) => i))
    return <>
      <div role="img" aria-label="Piles sorted from largest to smallest" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {ordered.map((value, i) => <div key={i} data-pile={i} style={{
          minWidth: 52, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
          border: `${active.has(i) ? 2 : 1}px solid ${i === triple?.[1] ? '#0891b2' : 'var(--border)'}`,
          background: i === triple?.[1] ? '#a5f3fc' : active.has(i) ? 'var(--surface2)' : 'transparent',
          opacity: taken.has(i) ? 1 : 0.5, color: '#1c1917',
        }}><div>{value}</div><small>{i === triple?.[0] ? 'Alice' : i === triple?.[1] ? 'you' : i === triple?.[2] ? 'Bob' : ''}</small></div>)}
      </div>
      <p>Your coins so far: <strong>{coins}</strong></p>
      <p>{run.input.piles.length / 3} rounds in total.</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Key idea:</strong> in each round Bob takes the smallest pile of the group, so you should always pair with Alice's largest and the next largest pile, which Bob cannot take.</p>
    <p><strong>Why the top three:</strong> taking the three largest remaining piles each round gives you the second of each group, and sorting makes this one scan.</p>
  </>} />
}
