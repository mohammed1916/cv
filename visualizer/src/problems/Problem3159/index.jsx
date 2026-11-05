import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Scan', description: 'Look for x in nums.' },
    { id: 'record', label: 'Record', description: 'Store the index of an occurrence of x.' },
    { id: 'query', label: 'Query', description: 'Answer a query with its occurrence index.' },
    { id: 'done', label: 'Result', description: 'All answers are ready.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums, queries (1 to 20 integers each) and x',
  url: 'https://leetcode.com/problems/find-occurrences-of-an-element-in-an-array/',
  complexity: 'O(n + q) time: one scan of nums, then one lookup per query.',
  examples: [
    { label: 'Example 1', input: '{"nums":[4,2,4,9,4],"queries":[2,1,5],"x":4}' },
    { label: 'Example 2', input: '{"nums":[5,6,7],"queries":[1,4],"x":6}' },
  ],
}

export default function FindOccurrences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.positions.length ? step.positions[step.positions.length - 1] : -1}
      roleAt={i => (step.positions.includes(i) ? 'match' : '')} />
    <output aria-label="Occurrence state">{step.query !== null ? `query ${step.query} answers ${step.answer}` : `occurrences found: ${step.positions.length}`}</output>
  </>} renderReasoning={() => <>
    <p>The indices of x are collected once, in order. A query for the k-th occurrence then reads position k of that list, or reports -1 when the list is shorter.</p>
  </>} />
}
