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
    { label: "Single number", input: "{\"nums\":[3],\"queries\":[3],\"x\":1}" },
    { label: "Values equal to x", input: "{\"nums\":[5,5,5],\"queries\":[5,1],\"x\":5}" },
    { label: "Long run: 20 numbers and 20 queries", input: "{\"nums\":[20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1],\"queries\":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],\"x\":10}" },
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
