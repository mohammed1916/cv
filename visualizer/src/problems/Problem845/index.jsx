import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Create the up and down run-length arrays.' },
    { id: 'up', label: 'Uphill pass', description: 'Left to right: extend the climb or reset it.' },
    { id: 'down', label: 'Downhill pass', description: 'Right to left: extend the descent or reset it.' },
    { id: 'skip', label: 'Not a peak', description: 'The index lacks a climb or a descent.' },
    { id: 'peak', label: 'Peak', description: 'Join climb and descent into a mountain length.' },
    { id: 'done', label: 'Complete', description: 'Return the longest mountain length.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Array arr (JSON)',
  url: 'https://leetcode.com/problems/longest-mountain-in-array/',
  complexity: 'O(n) time and O(n) space for the two run-length arrays (an O(1) two-pointer version also exists).',
  examples: [
    { label: 'Example 1', input: '[2,1,4,7,3,2,5]' },
    { label: 'Example 2', input: '[2,2,2]' },
    { label: 'Two mountains', input: '[0,1,2,1,0,3,5,6,2,1,1,4,3]' },
  ],
}
export default function LongestMountain() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="arr" length={run.input.length} active={step.index} valueAt={i => run.input[i]} roleAt={i => (step.up[i] && step.down[i] ? 'peak' : '')} />
    <IndexedSequence label="up (climb steps ending here)" length={run.input.length} active={step.index} valueAt={i => step.up[i]} />
    <IndexedSequence label="down (descent steps starting here)" length={run.input.length} active={step.index} valueAt={i => step.down[i]} />
    <output aria-label="Best">{step.phase === 'done' ? 'Longest mountain' : 'Best so far'}: {step.best}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why it works:</strong> a mountain is a strict climb followed by a strict descent around a peak. A peak at i extends up[i] steps left and down[i] steps right, so its length is up[i] + down[i] + 1, valid only when both are positive.</p>
  </>} />
}
