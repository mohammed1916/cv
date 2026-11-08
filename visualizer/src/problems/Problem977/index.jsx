import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { parseInput, buildTrace, code, python, phases } from './algorithm'

const definition = {
  number: '977',
  title: 'Squares of a Sorted Array',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums: a list of integers sorted from smallest to largest',
  url: 'https://leetcode.com/problems/squares-of-a-sorted-array/',
  complexity: 'O(n) time with two pointers and O(n) space for the result.',
  examples: [
    { label: 'Negatives on the left', input: JSON.stringify({ nums: [-6, -4, 1, 2, 5] }) },
    { label: 'All positive', input: JSON.stringify({ nums: [2, 3, 7] }) },
    { label: 'Zero in the middle', input: JSON.stringify({ nums: [-3, -1, 0, 4, 6] }) },
    { label: 'Single negative value', input: '{"nums":[-7]}' },
    { label: 'Equal negatives tie', input: '{"nums":[-3,-3,-3,2]}' },
    { label: 'Extremes at the limit', input: '{"nums":[-100,-100,0,100]}' },
    { label: 'Long run: 12 items', input: '{"nums":[-82,-74,-71,-60,-55,-38,-27,-25,-21,-6,58,93]}' },
  ],
}

function Output({ values, write }) {
  return <section aria-label="Squares placed so far" style={{ display: 'grid', gap: 6 }}>
    <h3 style={{ margin: 0 }}>Result, filled from the back</h3>
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {values.map((value, index) => <div key={index} data-filled={value !== null} style={{
        minWidth: 56, padding: '6px 8px', borderRadius: 6, textAlign: 'center',
        border: `2px solid ${index === write ? 'var(--primary)' : 'var(--border)'}`,
        background: value === null ? 'var(--surface2)' : 'var(--surface)', color: 'var(--text)',
      }}>
        <small style={{ display: 'block', color: 'var(--text-muted)' }}>[{index}]</small>
        <strong>{value === null ? '·' : value}</strong>
      </div>)}
    </div>
  </section>
}

export default function Problem977() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const nums = run.input.nums
    const hasPointers = step.l !== null
    return <>
      <IndexedSequence label="Input, sorted by value" length={nums.length} active={hasPointers ? step.r : -1}
        valueAt={index => nums[index]}
        roleAt={index => (hasPointers && index === step.l ? 'l' : hasPointers && index === step.r ? 'r' : '')} />
      <Output values={step.result} write={step.write} />
      {hasPointers && <p style={{ margin: 0, color: 'var(--text)' }}>Squares compared: {step.left} from l, {step.right} from r.</p>}
    </>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
