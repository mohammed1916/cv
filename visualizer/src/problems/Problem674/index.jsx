import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'First value', description: 'One value is a run of length 1.' },
    { id: 'grow', label: 'Grow window', description: 'A strictly larger value extends the current run.' },
    { id: 'reset', label: 'Restart run', description: 'A value that does not exceed its predecessor starts a new run.' },
    { id: 'best', label: 'Record best', description: 'Keep the longest window seen so far.' },
    { id: 'done', label: 'Answer', description: 'The longest continuous increasing run.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Array (JSON array of integers)',
  url: 'https://leetcode.com/problems/longest-continuous-increasing-subsequence/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Two runs', input: '[2,5,1,3,4,8]' },
    { label: 'All equal', input: '[7,7,7]' },
    { label: 'Single rise', input: '[-4,-1,0,6]' },
  ],
}

export default function LongestIncreasingRun() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values with window [l, r]" length={run.input.length} active={step.r}
      valueAt={i => run.input[i]}
      roleAt={i => (i === step.l && i === step.r ? 'l = r' : i === step.l ? 'l' : i === step.r ? 'r' : i >= step.l && i <= step.r ? 'in run' : '')} />
    <output aria-label="Best length">{`Window length ${step.r - step.l + 1} · best ${step.best}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why a sliding window:</strong> a run only needs its start moved when the order breaks, so one pass with l and r is enough.</p>
  </>} />
}
