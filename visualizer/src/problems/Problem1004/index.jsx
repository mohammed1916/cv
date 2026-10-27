import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty window and no zeros.' },
    { id: 'extend', label: 'Extend', description: 'Add the next value to the right edge.' },
    { id: 'shrink', label: 'Shrink', description: 'Remove values from the left until the window has at most k zeros.' },
    { id: 'record', label: 'Record', description: 'Keep the widest valid window seen so far.' },
    { id: 'done', label: 'Complete', description: 'Report the longest window.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (0/1) and k (JSON)',
  url: 'https://leetcode.com/problems/max-consecutive-ones-iii/',
  complexity: 'O(n) time and O(1) space. The visualization caps input at 30 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,1,1,0,0,0,1,1,1,1,0],"k":2}' },
    { label: 'Example 2', input: '{"nums":[0,0,1,1,0,0,1,1,1,0,1,1,0,0,0,1,1,1,1],"k":3}' },
  ],
}

export default function MaxConsecutiveOnes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Binary array" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.right}
      roleAt={i => (step.right >= 0 && i >= step.left && i <= step.right ? 'window' : '')} />
    <output aria-label="Window">{`Window ${step.left}-${step.right}, zeros ${step.zeros} of at most ${run.input.k}, best ${step.best}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The window only needs to be shortened when it holds more than k zeros, and each shrink removes one value from the left, so every index is visited a bounded number of times.</p>
  </>} />
}
