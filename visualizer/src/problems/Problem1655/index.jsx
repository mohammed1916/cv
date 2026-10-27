import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
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
  ],
}

export default function RepeatingIntegers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const m = run.input.quantity.length
    return <>
      <DPTable title="reachable[served set]: ✓ when a split exists" values={step.table} rowLabels={['reachable']}
        columnLabels={step.table[0].map((_, mask) => mask.toString(2).padStart(m, '0'))} />
      <output aria-label="Status">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Values are processed one at a time, because each distinct value can serve each customer at most once.</p>
    <p>A value with count c can serve a set of customers exactly when their total demand is at most c, so the table records which served sets are achievable.</p>
  </>} />
}
