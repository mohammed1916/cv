import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '169',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers (JSON), where one value appears more than half the time',
  url: 'https://leetcode.com/problems/majority-element/',
  complexity: 'O(n) time and O(1) extra space: one pass that keeps a single candidate and a vote count.',
  examples: [
    { label: 'Clear majority', input: '[2,2,1,1,1,2,2]' },
    { label: 'Single value', input: '[5]' },
    { label: 'Early candidate', input: '[-1,-1,7,-1]' },
    { label: 'Exactly more than half', input: '[7,7,7,7,1,2]' },
    { label: 'Extreme values at the limits', input: '[100,100,100,-100,-100,100,100]' },
    { label: 'Single negative value', input: '[-100]' },
    { label: 'Long run: 30 values with a majority', input: '[86,42,42,14,42,42,30,42,42,62,42,42,35,42,42,-5,42,42,20,42,42,-46,42,42,-70,42,42,-77,42,42]' },
  ],
}

export default function MajorityElementVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { index, candidate, count } = step.snapshot
    return <>
      <IndexedSequence label="Input array (pointer i marks the value being read)" length={run.input.length}
        active={index >= 0 && index < run.input.length ? index : -1} valueAt={i => run.input[i]}
        roleAt={i => (i === index ? 'i' : '')} />
      <dl aria-label="Vote state" style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '6px 16px', marginTop: 12, color: 'var(--text)' }}>
        <dt style={{ color: 'var(--text-muted)' }}>candidate</dt><dd style={{ margin: 0 }}>{candidate ?? 'none'}</dd>
        <dt style={{ color: 'var(--text-muted)' }}>count</dt><dd style={{ margin: 0 }}>{count}</dd>
      </dl>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why it works:</strong> a value that appears more than half the time cannot be cancelled out by all the other values combined, so the surviving candidate is the majority.</p>
  </>} />
}
