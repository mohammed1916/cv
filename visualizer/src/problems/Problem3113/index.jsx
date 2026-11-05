import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No subarray has been counted yet.' },
    { id: 'left', label: 'Left end', description: 'Fix the left end l and grow the right end r.' },
    { id: 'extend', label: 'Extend', description: 'Track the largest value between l and r.' },
    { id: 'count', label: 'Count', description: 'Both ends equal the largest value, so the subarray counts.' },
    { id: 'done', label: 'Result', description: 'The number of counted subarrays.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of 1 to 12 integers from 1 to 20',
  url: 'https://leetcode.com/problems/find-the-number-of-subarrays-where-boundary-elements-are-maximum/',
  complexity: 'O(n^2) time and O(1) extra space in this direct version, so the visualization stays readable. Larger inputs use a monotonic stack.',
  examples: [
    { label: 'Repeated peak', input: '[2,5,2,5,1]' },
    { label: 'All equal', input: '[3,3,3]' },
    { label: 'Two peaks', input: '[4,1,4,2]' },
  ],
}

export default function BoundaryMaximumSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.length} valueAt={i => run.input[i]}
      active={step.r >= 0 ? step.r : -1}
      roleAt={i => (step.l < 0 ? '' : i === step.l ? 'l' : i === step.r ? 'r' : i > step.l && i < step.r ? 'window' : '')} />
    <output aria-label="Current subarray">{step.l >= 0
      ? `subarray ${step.l}..${step.r}, largest ${step.max}, counted so far ${step.count}${step.counted ? ' (counted)' : ''}`
      : `counted so far ${step.count}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>A subarray qualifies when its first and last elements both equal its largest element. Checking every pair of ends is enough for this view.</p>
  </>} />
}
