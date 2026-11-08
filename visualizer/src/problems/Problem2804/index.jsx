import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Begin', description: 'Start at the first index.' },
    { id: 'step', label: 'Callback', description: 'Call the function with value and index.' },
    { id: 'done', label: 'Done', description: 'Every element has been visited.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with arr (array of values)',
  url: 'https://leetcode.com/problems/array-prototype-foreach/',
  complexity: 'O(n) time for an array of n elements, plus the cost of each callback.',
  examples: [
    { label: 'Three values', input: '{"arr":[3,1,4]}' },
    { label: 'Mixed', input: '{"arr":["x",true,null]}' },
    { label: 'Single value', input: '{"arr":[9]}' },
    { label: 'Equal values', input: '{"arr":[2,2,2]}' },
    { label: 'Boundary: negatives and large values', input: '{"arr":[-10000,10000,0]}' },
    { label: 'Long run: 20 values', input: '{"arr":[-43,38,37,45,-9,5,-33,-44,-20,-31,-40,39,-28,2,5,32,-5,4,7,-44]}' },
  ],
}

export default function ArrayPrototypeForEach() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Callback calls" length={step.out.length} valueAt={i => step.out[i]} active={step.at}
      roleAt={i => (i < step.at ? 'visited' : '')} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>forEach is a loop with a callback. The callback receives the value, its index and the array itself, and forEach returns nothing.</p>
  </>} />
}
