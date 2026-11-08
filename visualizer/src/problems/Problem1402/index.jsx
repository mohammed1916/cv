import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1402',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Satisfaction values (JSON array)',
  url: 'https://leetcode.com/problems/reducing-dishes/',
  complexity: 'O(n log n) time for the sort, then one linear pass. O(n) extra space for the sorted copy.',
  examples: [
    { label: 'Mixed', input: '[4, -2, 6, -1]' },
    { label: 'All negative', input: '[-3, -5]' },
    { label: 'Single dish', input: '[7]' },
    { label: "Single value", input: "[5]" },
    { label: "All zeros", input: "[0,0,0]" },
    { label: "Sixteen maximum values", input: "[100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100]" },
    { label: "Long run: 16 values", input: "[56,-11,56,13,54,83,32,-83,46,-75,84,69,-66,-33,-76,97]" },
  ],
}

const tile = { minWidth: 52, padding: 12, boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }

export default function ReducingDishes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { sorted, index, running, total, kept } = step.snapshot
    return <>
      <div role="img" aria-label="Dishes from highest to lowest satisfaction" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {sorted.map((value, i) => <div key={i} style={{
          ...tile, borderWidth: i === index ? 2 : 1,
          background: i < kept.length ? 'color-mix(in srgb, var(--success) 18%, var(--surface2))' : 'transparent', color: i < kept.length ? 'var(--text-muted)' : 'var(--text)',
        }}><div>{value}</div><small>{i + 1}{i === index ? ' i' : ''}</small></div>)}
      </div>
      <p>Running sum: <strong>{running}</strong> · Best total so far: <strong>{total}</strong></p>
      <p>Green dishes form the chosen prefix. Each one adds the running sum to the total.</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Prefix idea:</strong> the chosen dishes always form the highest-satisfaction prefix, because cooking the best dish last gives it the largest time multiplier.</p>
    <p><strong>Running sum rule:</strong> every prefix sum adds one more time unit to the dishes inside it, so keeping a dish is worth it only while the running sum stays non-negative.</p>
  </>} />
}
