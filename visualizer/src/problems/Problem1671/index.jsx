import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Nothing measured yet.' },
    { id: 'up', label: 'Rising run', description: 'Longest strictly increasing run ending at each index.' },
    { id: 'down', label: 'Falling run', description: 'Longest strictly decreasing run starting at each index.' },
    { id: 'peak', label: 'Peak', description: 'Combine both runs at each possible peak.' },
    { id: 'done', label: 'Complete', description: 'Report the removals.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (JSON)',
  url: 'https://leetcode.com/problems/minimum-number-of-removals-to-make-mountain-array/',
  complexity: 'O(n^2) time and O(n) space. The visualization caps n at 12.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,3,1]}' },
    { label: 'Example 2', input: '{"nums":[2,1,1,5,6,2,3,1]}' },
  ],
}

export default function MinimumMountainRemovals() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index}
      roleAt={i => (i === step.index ? 'current' : '')} />
    <output aria-label="Runs">{`Rising: [${step.up.map(v => v ?? '-').join(', ')}]  Falling: [${step.down.map(v => v ?? '-').join(', ')}]  Best kept: ${step.best ?? 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>A mountain is a strictly rising run followed by a strictly falling run, so every peak is an index with a rising run ending there and a falling run starting there.</p>
    <p>The kept length at a peak is the two runs joined at the peak, and every other value is removed.</p>
  </>} />
}
