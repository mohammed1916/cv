import IndexedSequence from '../../components/shared/IndexedSequence'
import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1262',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of positive integers (JSON)',
  url: 'https://leetcode.com/problems/greatest-sum-divisible-by-three/',
  complexity: 'O(n) time for n numbers, because each number updates three remainder slots. O(1) extra space.',
  examples: [
    { label: 'Mixed', input: '[3,6,5,1,8]' },
    { label: 'Single', input: '[4]' },
    { label: 'Equal', input: '[2,2,2]' },
    { label: 'Boundary values', input: '[1,99,50,99]' },
    { label: 'Descending run', input: '[9,7,5,3,1]' },
    { label: 'Long run: 12 values', input: '[68,30,62,82,27,75,77,54,33,83,22,48]' },
  ],
}

const SLOT_NAMES = ['remainder 0', 'remainder 1', 'remainder 2']

export default function GreatestSumDivisibleByThree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { nums, best, index, x } = step.snapshot
    return <>
      <IndexedSequence label="Numbers read left to right" length={nums.length} active={index}
        valueAt={i => nums[i]} roleAt={i => i === index ? 'current number' : ''} />
      <div aria-label="Best sum per remainder" style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        {best.map((v, r) => <div key={r} data-slot={r} style={{ minWidth: 120, border: `${r === 0 ? 2 : 1}px solid ${r === 0 ? 'var(--primary)' : 'var(--border)'}`, padding: 8, fontFamily: 'monospace' }}>
          <div>{SLOT_NAMES[r]}</div>
          <strong>{v === null ? 'none' : v}</strong>
        </div>)}
      </div>
      {x !== undefined && <p>Current number {x} adds to each reachable remainder class.</p>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Only remainders matter:</strong> for each remainder mod 3 we keep the largest sum that achieves it. Any larger sum with the same remainder can only do better later, so earlier, smaller choices are dropped.</p>
    <p><strong>Transition:</strong> taking a number x moves a selection from remainder r to remainder (r + x) mod 3, adding x to its sum. Skipping keeps the old value.</p>
  </>} />
}
