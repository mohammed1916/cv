import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { parseInput, buildTrace, code, python, phases } from './algorithm'

const definition = {
  number: '974',
  title: 'Subarray Sums Divisible by K',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums: a list of integers, and k: the divisor from 2 to 12',
  url: 'https://leetcode.com/problems/subarray-sums-divisible-by-k/',
  complexity: 'O(n) time: one pass over the values, with one bucket per remainder. O(k) space.',
  examples: [
    { label: 'Mixed signs', input: JSON.stringify({ nums: [2, 3, 5, -4, 1], k: 5 }) },
    { label: 'Single value', input: JSON.stringify({ nums: [7], k: 9 }) },
    { label: 'Repeated remainders', input: JSON.stringify({ nums: [-1, -1, 2, 2, 2], k: 3 }) },
  ],
}

export default function Problem974() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const k = run.input.k
    const last = step.index ?? -1
    return <>
      <IndexedSequence label="Values" length={run.input.nums.length} active={last}
        valueAt={index => run.input.nums[index]}
        roleAt={index => (index <= last ? 'read' : '')} />
      <section aria-label="Prefix remainders" style={{ display: 'grid', gap: 6 }}>
        <h3 style={{ margin: 0 }}>How many earlier prefixes had each remainder</h3>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${k}, minmax(48px, 1fr))`, gap: 6 }}>
          {step.count.map((count, r) => <div key={r} data-remainder={r} style={{
            border: '1px solid var(--border)', borderRadius: 6, padding: 6, textAlign: 'center',
            background: r === step.remainder ? 'var(--primary-glow)' : 'var(--surface)', color: 'var(--text)',
          }}>
            <small style={{ color: 'var(--text-muted)' }}>remainder {r}</small>
            <div><strong>{count}</strong></div>
          </div>)}
        </div>
        <p style={{ margin: 0, color: 'var(--text)' }}>Prefix remainders so far: {step.prefixes.join(', ')}. Running total: {step.answer}.</p>
      </section>
    </>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
