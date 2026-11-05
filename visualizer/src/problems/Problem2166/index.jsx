import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BitsetView from './BitsetView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2166',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Bitset calls as JSON, e.g. {"size":4,"ops":[["fix",2],["flip"],["count"]]}',
  url: 'https://leetcode.com/problems/design-bitset/',
  complexity: 'Each call is O(1) time and the bit array uses O(size) space. The visualization caps size at 16 and the operation list at 24.',
  examples: [
    { label: 'Fix, flip, count', input: '{"size":4,"ops":[["fix",2],["flip"],["count"],["toString"]]}' },
    { label: 'Single bit', input: '{"size":1,"ops":[["all"],["fix",0],["all"],["flip"],["one"]]}' },
    { label: 'Unfix on empty', input: '{"size":3,"ops":[["unfix",1],["count"],["one"]]}' },
  ],
}

export default function Problem2166Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <BitsetView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
