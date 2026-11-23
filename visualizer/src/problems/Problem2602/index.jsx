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
  question: "Given an array and queries, for each query find the minimum number of increment or decrement operations needed to make every element equal to that query value.",
  approaches: [
    { name: "Sort and prefix sums", intuition: "Sort the array once; split at the query value with binary search and use prefix sums to cost each side in constant time.", time: "O(n log n + q log n)", space: "O(n)" },
    { name: "Brute force per query", intuition: "Scan the whole array for every query and sum the distances.", time: "O(n * q)", space: "O(1)" },
  ],
  examples: [
    { label: 'Six values, three queries', input: '{"nums":[5,12,3,8,14,2],"queries":[9,1,20]}' },
    { label: 'Repeated values, four queries', input: '{"nums":[6,6,6],"queries":[1,6,15,18]}' },
    { label: 'Single number and query', input: '{"nums":[1],"queries":[1]}' },
    { label: 'Equal numbers and repeated queries', input: '{"nums":[5,5,5],"queries":[5,5]}' },
    { label: 'Limit values', input: '{"nums":[20,1,20,1,20,1,20,1],"queries":[20,1,10,2,15]}' },
    { label: 'Long run: eight numbers and five queries', input: '{"nums":[18,17,20,11,6,9,8,3],"queries":[3,2,1,16,11]}' },
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
