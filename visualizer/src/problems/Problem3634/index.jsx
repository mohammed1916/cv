import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Order the values so a kept set is a run of neighbours.' },
    { id: 'window', label: 'Minimum', description: 'Pick the smallest kept value.' },
    { id: 'grow', label: 'Grow', description: 'Extend the run while the next value still fits the limit.' },
    { id: 'record', label: 'Record', description: 'Keep the longest run seen so far.' },
    { id: 'done', label: 'Result', description: 'Removals are the values outside the best run.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (positive integers) and k',
  url: 'https://leetcode.com/problems/minimum-removals-to-balance-array/',
  complexity: 'O(n log n) time for the sort, then O(n) for the two pointers. The visualization caps nums at 20 values.',
  examples: [
    { label: 'Example', input: '{"nums":[1,3,6,9],"k":2}' },
    { label: 'Tight limit', input: '{"nums":[4,4,9,10,30],"k":1}' },
  ],
}

export default function MinimumRemovalsToBalanceArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const [from, to] = step.phase === 'done' ? run.keep : [step.i, step.j]
    return <>
      <IndexedSequence label="sorted nums" length={run.sorted.length} valueAt={i => run.sorted[i]} active={step.i >= 0 ? step.i : 0}
        roleAt={i => (step.i >= 0 && i >= from && i < to ? (step.phase === 'done' ? 'keep' : 'window') : '')} />
      <output aria-label="Balance check">{`minimum ${step.i >= 0 ? run.sorted[step.i] : 'none'}, top of run ${step.i >= 0 ? run.input.k * run.sorted[step.i] + run.sorted[step.i] : 'none'}, best run ${step.best ?? 0}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>After sorting, a run is balanced exactly when its largest value minus its smallest is at most k times its smallest, so the largest value may reach (k + 1) times the smallest. The smallest value is the left end, so the right end only moves forward.</p>
    <p>Each value is passed by the right pointer at most once, so the whole scan is linear after the sort.</p>
  </>} />
}
