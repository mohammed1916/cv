import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin the prefix GCD list.' },
    { id: 'prefix', label: 'Prefix GCD', description: 'Pair each value with the running maximum.' },
    { id: 'sort', label: 'Sort', description: 'Order the prefix GCDs.' },
    { id: 'pair', label: 'Pair', description: 'Add the GCD of the smallest and largest remaining values.' },
    { id: 'done', label: 'Complete', description: 'Report the sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array (JSON object with nums)',
  url: 'https://leetcode.doocs.org/en/lc/3867/',
  complexity: 'O(n log n) time and O(n) space. The visualization caps input at 30 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,6,4]}' },
    { label: 'Example 2', input: '{"nums":[3,6,2,8]}' },
    { label: 'Single value', input: '{"nums":[1]}' },
    { label: 'Equal values', input: '{"nums":[6,6]}' },
    { label: 'Largest values', input: '{"nums":[1000000000,1000000000,999999999]}' },
    { label: 'Long run: 30 values', input: '{"nums":[663958,969183,544888,572071,890827,912911,715411,392103,348746,288353,926796,813421,575253,138074,991236,755148,719441,189390,10766,972527,285769,527787,870595,695755,546338,720931,182619,530162,128244,590858]}' },
  ],
}

export default function SumGcdFormedPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="prefixGcd (sorted once built)" length={step.sorted.length} valueAt={i => step.sorted[i]} active={step.pair ? step.pair[0] : -1}
      roleAt={i => (step.pair && (i === step.pair[0] || i === step.pair[1]) ? 'pair' : '')} />
    <output aria-label="Total">{`Input length ${run.input.nums.length}, total ${step.total ?? 0}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>After sorting, the smallest value pairs with the largest, the next pair moves inward, and an odd middle value is skipped.</p>
  </>} />
}
