import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { meta } from './meta'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: meta.number,
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Sorted array of integers (JSON)',
  url: `https://leetcode.com/problems/${meta.slug}/`,
  complexity: 'O(n) time and O(n) space: the total and a running prefix sum give every answer in one pass.',
  examples: [
    { label: 'Spread', input: '[1,4,6,9]' },
    { label: 'Negatives', input: '[-3,-3,2]' },
    { label: 'Equal', input: '[7,7,7]' },
  ],
}

export default function SumAbsoluteDifferences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { index, value, before, after, below, above, result } = step.snapshot
    return <>
      <div role="img" aria-label="Sorted values" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {run.input.map((v, i) => <div key={i} data-index={i} style={{
          minWidth: 48, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
          border: `${i === index ? 2 : 1}px solid ${i === index ? 'var(--text)' : 'var(--border)'}`,
          background: index !== null && i < index ? 'var(--surface2)' : 'transparent',
        }}><div>{v}</div><small>{i}</small></div>)}
      </div>
      {index !== null && <p>Value {value} at index {index}: {below} before it (sum {before}), {above} after it (sum {after}).</p>}
      <p style={{ fontFamily: 'monospace' }}>Answers so far: [{result.join(', ')}]</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Split at the current value:</strong> values to the left are never larger, so their gap is value times count minus their sum; values to the right give the mirror term.</p>
    <p><strong>Running sums:</strong> the total and a prefix sum move one value at a time, so no pair is compared twice.</p>
  </>} />
}
