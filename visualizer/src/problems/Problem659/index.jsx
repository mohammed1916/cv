import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Counts', description: 'Count every value.' },
    { id: 'extend', label: 'Extend run', description: 'Append to a run that ends just before the value.' },
    { id: 'start-new', label: 'New run', description: 'Start a run that needs the next two values.' },
    { id: 'reject', label: 'Reject', description: 'The value fits no run.' },
    { id: 'done', label: 'Complete', description: 'Report whether every value was placed.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Sorted array nums (JSON)',
  url: 'https://leetcode.com/problems/split-array-into-consecutive-subsequences/',
  complexity: 'O(n) expected time with hash maps for counts and run tails.',
  examples: [
    { label: 'Two runs', input: '[1,2,3,3,4,5]' },
    { label: 'Extend', input: '[1,2,3,3,4,4,5,5]' },
    { label: 'Fails', input: '[1,2,3,4,4,5]' },
  ],
}

export default function ConsecutiveSubsequences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Sorted values" length={run.input.length} active={run.input.indexOf(step.value)} valueAt={i => run.input[i]} />
    <output aria-label="Runs">Run tails: {Object.entries(step.tails).filter(([, c]) => c > 0).map(([end, c]) => `…${end} ×${c}`).join(', ') || 'none'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Greedy choice:</strong> extending an existing run is always at least as good as starting a new one, because it keeps the values needed later.</p>
  </>} />
}
