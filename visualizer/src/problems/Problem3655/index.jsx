import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '3655',
  phases: [
    { id: 'start', label: 'Start', description: 'The array before any query.' },
    { id: 'query', label: 'Query', description: 'Choose the range and stride for this query.' },
    { id: 'update', label: 'Update', description: 'Multiply one touched value.' },
    { id: 'done', label: 'Result', description: 'XOR every final value.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and queries ([l, r, k, v] entries)',
  url: 'https://leetcode.com/problems/xor-after-range-multiplication-queries-ii/',
  complexity: 'Simulates every visited index, so the work is the total number of stride steps across queries. The visualization caps the input size.',
  examples: [
    { label: 'Stride two', input: '{"nums":[3,5,2,7],"queries":[[0,3,2,2],[1,1,1,3]]}' },
    { label: 'Single query', input: '{"nums":[9,2,9,2],"queries":[[0,3,1,5]]}' },
  ],
}

export default function XorAfterRangeMultiplicationQueriesII() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={step.values.length} valueAt={i => step.values[i]} active={step.at}
      roleAt={i => (step.query && i >= step.query.l && i <= step.query.r ? ((i - step.query.l) % step.query.k === 0 ? 'touched' : 'in range') : '')} />
    <output aria-label="Query">{step.query ? `Query ${step.query.index + 1}: range ${step.query.l} to ${step.query.r}, stride ${step.query.k}, factor ${step.query.v}` : `Final XOR: ${run.result}`}</output>
  </>} renderReasoning={() => <>
    <p>Each query only visits the indices l, l + k, l + 2k and so on up to r. Every visited value is multiplied by v modulo 1000000007.</p>
    <p>The answer is the XOR of the final values, computed once after all queries have run.</p>
  </>} />
}
