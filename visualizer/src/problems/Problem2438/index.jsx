import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Powers', description: 'Split n into the powers of two given by its set bits.' },
    { id: 'query', label: 'Query', description: 'Start a product over the chosen range.' },
    { id: 'multiply', label: 'Multiply', description: 'Multiply in the next power, modulo 1e9 + 7.' },
    { id: 'record', label: 'Record', description: 'Store the product as this query’s answer.' },
    { id: 'done', label: 'Complete', description: 'Report every answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'n and queries as JSON, e.g. {"n": 15, "queries": [[0,1],[2,2],[0,3]]}',
  url: 'https://leetcode.com/problems/range-product-queries-of-powers/',
  complexity: 'O(log n + q * log n) time for q queries, since at most 30 powers exist.',
  examples: [
    { label: 'Example 1', input: '{"n": 15, "queries": [[0,1],[2,2],[0,3]]}' },
  ],
}

export default function RangeProductPowers() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const [left, right] = step.query ?? [-1, -2]
    return <>
      <IndexedSequence label={`Powers of two for n = ${run.input.n}`} length={step.powers.length} valueAt={i => step.powers[i]}
        active={step.k ?? -1} roleAt={i => (i >= left && i <= right ? 'in-range' : '')} />
      <output aria-label="Product so far">{`Product: ${step.product}. Answers: [${step.answers.join(', ')}]`}</output>
      <p>{step.phase === 'multiply' ? `Multiply by ${step.powers[step.k]}` : ''}</p>
    </>
  }} renderReasoning={() => (
    <>
      <p>The binary digits of n list exactly the powers of two that sum to n, and their order is fixed, so every query is a slice of one array.</p>
      <p>Each product is taken modulo 1000000007 after every multiplication so the running value stays small.</p>
    </>
  )} />
}
