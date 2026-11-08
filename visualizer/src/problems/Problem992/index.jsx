import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import RecordStateTable from '../../components/shared/RecordStateTable'
import { parseInput, buildTrace, code, python, phases } from './algorithm'

const definition = {
  number: '992',
  title: 'Subarrays with K Different Integers',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums: up to 12 integers from 1 to 9, and k: from 1 to 9',
  url: 'https://leetcode.com/problems/subarrays-with-k-different-integers/',
  complexity: 'O(n) per pass with two passes, each pointer moving only forward. O(n) space for the counts.',
  examples: [
    { label: 'Two distinct values', input: JSON.stringify({ nums: [2, 1, 2, 3, 1], k: 2 }) },
    { label: 'Three distinct values', input: JSON.stringify({ nums: [4, 5, 4, 6, 5], k: 3 }) },
    { label: 'Repeats only', input: JSON.stringify({ nums: [3, 3, 3, 3], k: 1 }) },
    { label: 'Smallest: one value', input: '{"nums":[1],"k":1}' },
    { label: 'Repeated values with equal counts', input: '{"nums":[1,2,1,2],"k":2}' },
    { label: 'k above the distinct count', input: '{"nums":[1,9,1,9,1,9,1,9,1,9,1,9],"k":9}' },
    { label: 'Long run: 12 values', input: '{"nums":[1,2,6,4,9,4,1,8,7,7,6,3],"k":3}' },
  ],
}

export default function Problem992() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const nums = run.input.nums
    const inWindow = index => step.l !== null && index >= step.l && index <= step.r
    const counts = step.window.map(([value, count]) => ({ value, count }))
    return <>
      <IndexedSequence label={`Values (window ${step.l === null ? '–' : `${step.l} to ${step.r}`})`} length={nums.length} active={step.r ?? -1}
        valueAt={index => nums[index]}
        roleAt={index => (step.l === index ? 'l' : step.r === index ? 'r' : inWindow(index) ? 'in window' : '')} />
      <RecordStateTable label="Counts inside the window" columns={['value', 'count']} rows={counts} activeRow={-1} />
      <p style={{ margin: 0, color: 'var(--text)' }}>
        Pass with limit {step.limit}: {step.distinct === null ? '' : `${step.distinct} distinct`}. Subarrays counted so far in this pass: {step.subtotal}.
      </p>
    </>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
