import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import XorReverseView from './XorReverseView'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '3526',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Object with nums and queries ([1,index,value], [2,left,right] or [3,left,right])',
  url: 'https://leetcode.com/problems/range-xor-queries-with-subarray-reversals/',
  complexity: 'O(q * n) time and O(n) extra space for q queries over n values: each XOR query folds its range and each reversal swaps inward pairs. The visualization caps nums at 8 values and queries at 8.',
  examples: [
    { label: 'Reverse then XOR', input: '{"nums":[1,2,3,4,5],"queries":[[3,0,4],[2,0,2],[2,1,3]]}' },
    { label: 'Assignment persists', input: '{"nums":[6,1,8],"queries":[[1,1,9],[2,0,2],[3,0,1],[2,0,0]]}' },
    { label: 'Single value', input: '{"nums":[7],"queries":[[2,0,0]]}' },
    { label: 'Single value, query only', input: '{"nums":[0],"queries":[[2,0,0]]}' },
    { label: 'Equal values', input: '{"nums":[5,5,5,5],"queries":[[2,0,3],[3,1,2],[1,0,5],[2,0,0]]}' },
    { label: 'Largest values', input: '{"nums":[15,15,15,15,15,15,15,15],"queries":[[1,7,0],[2,0,7],[3,0,7]]}' },
    { label: 'Long run: 8 entries, 8 queries', input: '{"nums":[10,7,12,5,11,14,13,1],"queries":[[3,7,7],[2,6,6],[2,6,7],[2,2,2],[1,4,11],[2,0,6],[3,1,6],[2,3,6]]}' },
  ],
}

export default function RangeXorReversalsVisualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => <XorReverseView run={run} step={step} />}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
