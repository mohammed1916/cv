import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'query', label: 'Query', description: 'Start a fresh count for the segment [l, r].' },
    { id: 'extend', label: 'Extend', description: 'Add the current run length: every stable subarray ending here.' },
    { id: 'break', label: 'Break', description: 'An inversion ends the stable run.' },
    { id: 'answer', label: 'Answer', description: 'Store the count for this query.' },
    { id: 'done', label: 'Result', description: 'All answers are ready.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and queries ([l, r] pairs)',
  url: 'https://leetcode.com/problems/count-stable-subarrays/',
  complexity: 'O(n * q) time for this visualization, which caps the sizes. A prefix-based method is needed for the full limits.',
  examples: [
    { label: 'Example', input: '{"nums":[2,4,1,3],"queries":[[0,2],[1,3]]}' },
    { label: 'Sorted run', input: '{"nums":[1,2,2,1],"queries":[[0,3]]}' },
  ],
}

export default function CountStableSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.at}
      roleAt={i => (step.l !== null && step.l !== undefined && i >= step.l && i <= step.r ? 'window' : '')} />
    <output aria-label="Query state">{`query [${step.l ?? '-'}, ${step.r ?? '-'}], run ${step.run}, total ${step.total}, answers ${step.answers.join(', ') || 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>A subarray is stable exactly when it is non-decreasing. Scanning a query left to right, every index can end as many stable subarrays as the current run has elements.</p>
    <p>When a value drops below its predecessor, the run starts over from that index.</p>
  </>} />
}
