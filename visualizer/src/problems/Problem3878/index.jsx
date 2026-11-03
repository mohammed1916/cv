import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'window', label: 'Windows', description: 'Extend the window to the right and update the OR.' },
    { id: 'done', label: 'Result', description: 'Report the number of good subarrays.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums, a list of integers from 0 to 15',
  url: 'https://leetcode.com/problems/count-good-subarrays/',
  complexity: 'This visual tries every subarray: O(n^2) windows with an O(n) membership check. The visual caps nums at 12 values.',
  examples: [
    { label: 'Example', input: '{"nums":[5,1,4]}' },
    { label: 'Repeats', input: '{"nums":[2,2,6]}' },
  ],
}

export default function CountGoodSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.right}
      roleAt={i => (step.left >= 0 && i >= step.left && i <= step.right ? 'window' : '')} />
    <output aria-label="Window status">{step.running === null ? `Count ${step.count}` : `Window [${step.left}..${step.right}] OR ${step.running}, count ${step.count}, ${step.good ? 'good' : 'not good'}`}</output>
  </>} renderReasoning={() => <>
    <p>A subarray is good when its OR is one of its own elements. The OR only gains bits as the window grows, so every window is checked against its current OR.</p>
    <p>Each window is checked directly here, which keeps the logic easy to follow on small inputs.</p>
  </>} />
}
