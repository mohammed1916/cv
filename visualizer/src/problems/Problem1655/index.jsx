import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Nobody served', description: 'Only the empty set of customers is reachable.' },
    { id: 'value', label: 'Next value', description: 'Let this value serve any group of customers whose demand fits its count.' },
    { id: 'done', label: 'Complete', description: 'Check whether every customer is in a reachable set.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Orders (JSON object with nums as values and quantity as demands)',
  url: 'https://leetcode.com/problems/distribute-repeating-integers/',
  complexity: 'O(distinct * 3^m) time with m customers. The visualization caps input at 8 values and 4 customers.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,3,4],"quantity":[2]}' },
    { label: 'Example 2', input: '{"nums":[1,2,3,3],"quantity":[2]}' },
    { label: 'One value', input: '{"nums":[3],"quantity":[1]}' },
    { label: 'Equal values', input: '{"nums":[2,2,2,2],"quantity":[2,2]}' },
    { label: 'Largest sizes', input: '{"nums":[10,10,10,10,10,10,10,10],"quantity":[10,10,10,10]}' },
    { label: 'Long run: 8 values, 4 customers', input: '{"nums":[8,6,8,8,6,1,7,2],"quantity":[1,5,5,7]}' },
  ],
}

export default function RepeatingIntegers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const m = run.input.quantity.length
    return <>
      <IndexedSequence label="Customer values (nums)" length={run.input.nums.length} valueAt={i => run.input.nums[i]} />
      <IndexedSequence label="Demands (quantity)" length={run.input.quantity.length} valueAt={i => run.input.quantity[i]} />
      <DPTable title="reachable[served set]: ✓ when a split exists" values={step.table} rowLabels={['reachable']}
        columnLabels={step.table[0].map((_, mask) => mask.toString(2).padStart(m, '0'))} />
      <output aria-label="Status">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Values are processed one at a time, because each distinct value can serve each customer at most once.</p>
    <p>A value with count c can serve a set of customers exactly when their total demand is at most c, so the table records which served sets are achievable.</p>
  </>} />
}
