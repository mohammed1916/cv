import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { parseInput, buildTrace, code, python, phases } from './algorithm'

const definition = {
  number: '962',
  title: 'Maximum Width Ramp',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums: a list of integers',
  url: 'https://leetcode.com/problems/maximum-width-ramp/',
  complexity: 'O(n) time: each position is pushed and popped at most once. O(n) space for the stack.',
  examples: [
    { label: 'Ramp across the middle', input: JSON.stringify({ nums: [5, 1, 7, 2, 0, 6, 3] }) },
    { label: 'Two dips', input: JSON.stringify({ nums: [4, 9, 2, 7, 1, 8, 3, 6] }) },
    { label: 'No ramp', input: JSON.stringify({ nums: [5, 4, 3, 2] }) },
    { label: 'Two values', input: '{"nums":[0,1]}' },
    { label: 'Equal values', input: '{"nums":[7,7,7,7]}' },
    { label: 'Largest values', input: '{"nums":[99,0,99,0,99,0,99,0]}' },
    { label: 'Long run: 16 values', input: '{"nums":[1,31,11,78,84,37,83,64,65,73,31,28,29,95,13,40]}' },
  ],
}

export default function Problem962() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.nums.length} active={step.right ?? -1}
      valueAt={index => run.input.nums[index]}
      roleAt={index => (index === step.left ? 'l (start)' : index === step.right ? 'r (end)' : step.stack.includes(index) ? 'candidate' : '')} />
    <section aria-label="Candidate starts stack" style={{ display: 'grid', gap: 6 }}>
      <h3 style={{ margin: 0 }}>Candidate starts (bottom to top)</h3>
      <p style={{ margin: 0, color: 'var(--text)' }}>{step.stack.length ? step.stack.map(i => `${i}:${run.input.nums[i]}`).join('  ·  ') : 'empty'}</p>
      <p style={{ margin: 0, color: 'var(--text-muted)' }}>Best width so far: {step.best}{step.bestPair ? ` from index ${step.bestPair[0]} to ${step.bestPair[1]}` : ''}.</p>
    </section>
  </>} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
