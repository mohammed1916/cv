import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Sort the numbers and build prefix sums.' },
    { id: 'query', label: 'Query', description: 'Split the numbers at the target and total both costs.' },
    { id: 'done', label: 'Complete', description: 'Return the costs in query order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object: {"nums": [...], "queries": [...]}',
  url: 'https://leetcode.com/problems/minimum-operations-to-make-all-array-elements-equal/',
  complexity: 'Sorting once, then one binary search and two prefix-sum lookups per query. The visualization caps input at 8 numbers and 5 queries.',
  examples: [
    { label: 'Example 1', input: '{"nums":[3,1,6,8],"queries":[1,5]}' },
    { label: 'Example 2', input: '{"nums":[2,9,6,3],"queries":[10]}' },
  ],
}

export default function EqualizeCosts() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers, sorted" length={run.prefix ? run.prefix.length - 1 : 0} valueAt={i => run.result.length ? [...run.input.nums].sort((a, b) => a - b)[i] : ''} active={step.below ?? -1} />
    <output aria-label="Cost">{`Query ${step.query ?? '-'}: ${step.cost ?? '-'}`}</output>
  </>} renderReasoning={() => <>
    <p>For a target value, numbers below it must rise and numbers above it must fall, and each side's cost is a count times a value minus a sum.</p>
    <p>Prefix sums give each side's sum in constant time once the split point is found.</p>
  </>} />
}
