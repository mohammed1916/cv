import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Nothing counted yet.' },
    { id: 'left', label: 'Left end', description: 'Fix the left end and reset the interior maximum.' },
    { id: 'extend', label: 'Extend', description: 'Grow the interior to the right.' },
    { id: 'count', label: 'Count', description: 'Both ends beat the interior.' },
    { id: 'skip', label: 'Skip', description: 'This right end is not high enough.' },
    { id: 'stop', label: 'Stop', description: 'The interior has reached the left end.' },
    { id: 'done', label: 'Result', description: 'Report the number of bowls.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (integers from 0 to 1000)',
  url: 'https://leetcode.com/problems/count-bowl-subarrays/',
  complexity: 'O(n^2) time and O(1) extra space. The visualization caps nums at 30 values.',
  examples: [
    { label: 'Example', input: '{"nums":[5,1,2,6]}' },
    { label: 'Equal ends', input: '{"nums":[2,1,2]}' },
  ],
}

export default function CountBowlSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.right >= 0 ? step.right : step.left}
      roleAt={i => {
        if (step.left < 0) return ''
        if (i === step.left) return 'left'
        if (step.right >= 0 && i === step.right) return 'right'
        if (step.right >= 0 && i > step.left && i < step.right) return 'interior'
        return ''
      }} />
    <output aria-label="Bowl count">{`bowls = ${step.total}${step.inner !== null && step.inner !== undefined && Number.isFinite(step.inner) ? `, interior max = ${step.inner}` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>A bowl subarray has at least three values, and both end values are greater than every value strictly between them.</p>
    <p>For a fixed left end, the interior maximum only grows as the right end moves outward. Once it reaches the left value, no farther right end can form a bowl, so that left end stops early.</p>
  </>} />
}
