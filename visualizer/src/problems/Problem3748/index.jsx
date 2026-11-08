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
  complexity: 'O(n * q) time for this trace, which scans each query segment directly.',
  examples: [
    { label: 'Example', input: '{"nums":[2,4,1,3],"queries":[[0,2],[1,3]]}' },
    { label: 'Sorted run', input: '{"nums":[1,2,2,1],"queries":[[0,3]]}' },
    { label: "Single element", input: "{\"nums\":[4],\"queries\":[[0,0]]}" },
    { label: "Equal values", input: "{\"nums\":[5,5,5,5],\"queries\":[[0,3]]}" },
    { label: "Full and split ranges", input: "{\"nums\":[9,1,9,1,9,1,9,1,9,1,9,1],\"queries\":[[0,11],[0,0],[11,11],[0,5],[6,11],[3,8]]}" },
    { label: "Long run: 12 values, 6 queries", input: "{\"nums\":[4,5,5,4,3,7,3,5,2,9,7,9],\"queries\":[[1,11],[6,11],[2,9],[3,8],[0,1],[2,11]]}" },
  ],
}

export default function CountStableSubarrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.at}
      roleAt={i => (step.l === null || step.l === undefined ? '' : i === step.l ? 'l' : i === step.r ? 'r' : i > step.l && i < step.r ? 'window' : '')} />
    <output aria-label="Query state">{`query [${step.l ?? '-'}, ${step.r ?? '-'}], run ${step.run}, total ${step.total}, answers ${step.answers.join(', ') || 'none'}`}</output>
  </>} renderReasoning={() => <>
    <p>A subarray is stable exactly when it is non-decreasing. Scanning a query left to right, every index can end as many stable subarrays as the current run has elements.</p>
    <p>When a value drops below its predecessor, the run starts over from that index.</p>
  </>} />
}
