import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Sort', description: 'Sort and take the no-shift range as the baseline.' },
    { id: 'split', label: 'Try split', description: 'Prefix gets +k, suffix gets -k; compute the range.' },
    { id: 'improve', label: 'New best', description: 'This split beats the best range so far.' },
    { id: 'done', label: 'Complete', description: 'Return the smallest range.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object {nums, k} (JSON)',
  url: 'https://leetcode.com/problems/smallest-range-ii/',
  complexity: 'O(n log n) time for the sort, then O(n) for the splits. nums is capped at 100 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1],"k":0}' },
    { label: 'Example 2', input: '{"nums":[0,10],"k":2}' },
    { label: 'Example 3', input: '{"nums":[1,3,6],"k":3}' },
    { label: 'Larger', input: '{"nums":[7,8,8,5,2],"k":4}' },
  ],
}

export default function SmallestRangeII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Sorted nums (left of split: +k, right: -k)" length={run.sorted.length} active={step.split} valueAt={i => run.sorted[i]}
      roleAt={i => step.split < 0 ? '' : i <= step.split ? 'plus' : 'minus'} />
    <output aria-label="Range">{step.range === undefined ? '' : `This split: ${step.low} to ${step.high} (range ${step.range}). `}Best range: {step.ans}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>If a larger value were lowered while a smaller one was raised, swapping the choices never widens the range, so the optimum raises a prefix of the sorted array and lowers the rest.</p>
  </>} />
}
