import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import UnitConversionView from './UnitConversionView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Reference', description: 'Unit 0 is the reference with amount 1.' },
    { id: 'spread', label: 'Spread', description: 'Expand a unit whose amount is known.' },
    { id: 'assign', label: 'Assign', description: 'Scale the neighbor by the conversion factor.' },
    { id: 'query', label: 'Query', description: 'Reduce the ratio and report it modulo the prime.' },
    { id: 'done', label: 'Result', description: 'Every query has an answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, conversions ([a, b, f] triples) and queries ([a, b] pairs)',
  url: 'https://leetcode.com/problems/unit-conversion-ii/',
  complexity: 'O(n + q) time after one breadth first search, with exact BigInt fractions. The visualization caps n at 8 units and queries at 6; the answer is p times the modular inverse of q modulo 1000000007.',
  examples: [
    { label: 'Chain', input: '{"n":4,"conversions":[[0,1,2],[1,2,3],[1,3,5]],"queries":[[2,0],[0,3],[3,2]]}' },
    { label: 'Two units', input: '{"n":2,"conversions":[[0,1,3]],"queries":[[0,1],[1,0]]}' },
    { label: 'Two units, factor 4', input: '{"n":2,"conversions":[[0,1,4]],"queries":[[0,1]]}' },
    { label: 'Equal factors', input: '{"n":3,"conversions":[[0,1,2],[1,2,2]],"queries":[[0,2],[2,0]]}' },
    { label: 'Largest factors', input: '{"n":4,"conversions":[[0,1,9],[2,3,9],[1,2,9]],"queries":[[0,3],[3,0],[2,2]]}' },
    { label: 'Long run: 8 units, 6 queries', input: '{"n":8,"conversions":[[0,1,4],[1,2,1],[0,3,5],[3,4,7],[2,5,6],[3,6,6],[0,7,8]],"queries":[[3,5],[1,3],[0,1],[6,1],[7,5],[1,3]]}' },
  ],
}

export default function UnitConversionII() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <UnitConversionView run={run} step={step} />}
    renderReasoning={({ step }) => <>
      <p>{step.message}</p>
      <p>Each unit carries an exact amount relative to unit 0, so any query is one division of two amounts.</p>
    </>} />
}
