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
    { label: 'One value, one query', input: '{"nums":[1],"queries":[[0,0,1,1]]}' },
    { label: 'Equal values', input: '{"nums":[6,6,6],"queries":[[0,2,2,6]]}' },
    { label: 'Largest values and bounds', input: '{"nums":[1000000000,1000000000,1000000000,1000000000,1000000000,1000000000,1000000000,1000000000,1000000000,1000000000,1000000000,1000000000],"queries":[[0,11,12,100000]]}' },
    { label: 'Long run: 12 values, 6 queries', input: '{"nums":[10948343,13435675,7185165,16151163,5339341,8472942,13154662,3004983,14455094,9328828,2750964,12181032],"queries":[[2,4,11,56849],[9,10,12,95542],[4,7,2,89659],[6,6,5,63589],[8,11,10,79831],[4,11,7,81237]]}' },
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
