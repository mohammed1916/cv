import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'

const code = `call a function once for each element
  for i from 0 to length minus one
    callback(array[i], i, array)
  return nothing`
const python = `def for_each(array, callback):
    for i in range(len(array)):
        callback(array[i], i, array)`

function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.arr)) throw new Error('Use { "arr": [...] }.')
  return input
}

function buildTrace({ arr }) {
  const out = []
  const frames = [{ phase: 'start', activeLine: 1, message: `Visit ${arr.length} element(s) in order.`, at: -1, out: [] }]
  arr.forEach((value, i) => {
    out.push(`${i}:${JSON.stringify(value)}`)
    frames.push({ phase: 'step', activeLine: 3, message: `callback(${JSON.stringify(value)}, ${i}, array).`, at: i, out: [...out] })
  })
  frames.push({ phase: 'done', activeLine: 4, message: 'Returns nothing; the callbacks did the work.', at: -1, out: [...out] })
  return { frames }
}

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
  ],
}

export default function ArrayPrototypeForEach() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Callback calls" length={step.out.length} valueAt={i => step.out[i]} active={step.at} />
  </>} renderReasoning={() => <>
    <p>forEach is a loop with a callback. The callback receives the value, its index and the array itself.</p>
    <p>It returns nothing, so its usefulness comes from side effects inside the callback.</p>
  </>} />
}
