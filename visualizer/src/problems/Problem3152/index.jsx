import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Start the count of same-parity neighbours at zero.' },
    { id: 'count', label: 'Count pairs', description: 'Mark each adjacent pair that shares a parity.' },
    { id: 'query', label: 'Queries', description: 'Compare two prefix counts for each query.' },
    { id: 'done', label: 'Complete', description: 'Report every answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with nums (1 to 12 integers from 1 to 10) and queries ([from, to] pairs)',
  url: 'https://leetcode.com/problems/special-array-ii/',
  complexity: 'O(n + q) time after the prefix pass. The visualization caps input at 12 numbers and 6 queries.',
  examples: [
    { label: 'Example 1', input: '{"nums":[4,3,1,6],"queries":[[0,2],[2,3],[0,3]]}' },
    { label: 'Single', input: '{"nums":[2,2],"queries":[[1,1]]}' },
  ],
}

export default function SpecialArrayII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.index}
      roleAt={index => step.range && index >= step.range[0] && index <= step.range[1] ? 'in query' : ''} />
    <output aria-label="Prefix counts">{`Same-parity pairs up to each index: ${step.bad.join(', ')}`}</output>
  </>} renderReasoning={() => <>
    <p>A range is special when no adjacent pair inside it shares a parity, so counting the bad pairs turns every query into a comparison of two prefix counts.</p>
    <p>The count for a range is the difference of the prefix counts at its ends, so each query costs constant time.</p>
  </>} />
}
