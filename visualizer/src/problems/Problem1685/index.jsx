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
    { label: 'Two values', input: '[-3,5]' },
    { label: 'Equal values', input: '[2,2,2,2]' },
    { label: 'Full range, 12 values', input: '[-100,-100,-50,-50,0,0,25,25,50,50,100,100]' },
    { label: 'Long run: 12 values', input: '[-93,-81,-56,-55,-46,-22,-20,-15,-6,2,42,60]' },
  ],
}

const tile = (state) => ({
  minWidth: 52, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace', borderRadius: 8,
  border: `2px solid ${state === 'current' ? 'var(--primary)' : 'var(--border)'}`,
  background: state === 'below' ? 'var(--surface2)' : state === 'current' ? 'var(--primary)' : 'var(--surface)',
  color: state === 'current' ? 'var(--on-primary, #fff)' : 'var(--text)',
})

export default function SumAbsoluteDifferences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { index, value, before, after, below, above, answer, leftGap, rightGap, result } = step.snapshot
    return <>
      <p style={{ margin: '0 0 6px' }}>The array is sorted, so every value before the current index is no larger than it and every value after it is no smaller.</p>
      <div role="img" aria-label="Sorted values split at the current index" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {run.input.map((v, i) => <div key={i} data-index={i} style={tile(i === index ? 'current' : index !== null && i < index ? 'below' : 'above')}>
          <div>{v}</div><small>{i}</small>
        </div>)}
      </div>
      {index !== null && <table aria-label="Split sums at this index" style={{ borderCollapse: 'collapse', fontFamily: 'monospace', marginBottom: 10 }}>
        <tbody>
          <tr><th scope="row">current value</th><td>{value}</td></tr>
          <tr><th scope="row">left side</th><td>{below} value{below === 1 ? '' : 's'}, sum {before}</td></tr>
          <tr><th scope="row">right side</th><td>{above} value{above === 1 ? '' : 's'}, sum {after}</td></tr>
          {answer !== undefined && <tr><th scope="row">left gap</th><td>{value} × {below} − {before} = {leftGap}</td></tr>}
          {answer !== undefined && <tr><th scope="row">right gap</th><td>{after} − {value} × {above} = {rightGap}</td></tr>}
        </tbody>
      </table>}
      <p style={{ fontFamily: 'monospace' }}>Answers so far: [{result.join(', ')}]</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Split at the current value:</strong> values to the left are never larger, so their gap is value times count minus their sum; values to the right give the mirror term.</p>
    <p><strong>Running sums:</strong> the total and a prefix sum move one value at a time, so no pair is compared twice.</p>
  </>} />
}
