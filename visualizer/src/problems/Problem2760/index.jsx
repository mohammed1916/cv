import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the best length to zero.' },
    { id: 'skip', label: 'Skip', description: 'Odd values and values above the threshold cannot start a run.' },
    { id: 'begin', label: 'Begin run', description: 'An even value under the threshold starts a run.' },
    { id: 'extend', label: 'Extend', description: 'Add the next value while parity alternates and it stays under the threshold.' },
    { id: 'record', label: 'Record', description: 'Keep the longest run seen so far.' },
    { id: 'done', label: 'Complete', description: 'Report the longest run.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums and threshold',
  url: 'https://leetcode.com/problems/longest-even-odd-subarray-with-threshold/',
  complexity: 'O(n) time and O(1) extra space. The visualization caps input at 12 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[3,2,5,4],"threshold":5}' },
    { label: 'Example 3', input: '{"nums":[2,3,4,5],"threshold":4}' },
  ],
}

export default function LongestEvenOddSubarray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.end}
      roleAt={i => (i >= step.start && i <= step.end ? 'run' : '')} />
    <output aria-label="Run">{`Threshold ${run.input.threshold}. Run ${step.start} to ${step.end}, best ${step.best}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Every candidate run starts at an even value, so each start is checked once and the run extends while the parity alternates.</p>
  </>} />
}
