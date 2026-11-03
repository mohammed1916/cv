import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import SegmentView from './SegmentView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Open the first subarray.' },
    { id: 'extend', label: 'Extend', description: 'The running gcd stays above one.' },
    { id: 'cut', label: 'Cut', description: 'The gcd would fall to one, so start again.' },
    { id: 'impossible', label: 'Blocked', description: 'A lone one cannot form a valid subarray.' },
    { id: 'done', label: 'Result', description: 'Report the subarray count.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'List of positive integers (e.g. [6,10,15,7])',
  url: 'https://leetcode.com/problems/minimum-split-into-subarrays-with-gcd-greater-than-one/',
  complexity: 'O(n log V) time and O(n) space for n elements up to V, since each gcd step is logarithmic. The visualization caps the input at 10 values up to 60; a value of 1 gives -1.',
  examples: [
    { label: 'Mixed', input: '[6,10,15,7,9]' },
    { label: 'Blocked by one', input: '[12,18,1,8]' },
    { label: 'Singletons', input: '[5,7,11]' },
  ],
}

export default function MinimumSubarraysGcd() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <SegmentView run={run} step={step} />} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Greedy from the left is optimal here: if a subarray has gcd above one, every shorter piece inside it does too, so making each piece as long as possible never costs an extra cut.</p>
  </>} />
}
