import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'

const code = `build an object from parallel key and value arrays
  result = empty object
  for each position i
    result[keys[i]] = values[i]
  return result`
const python = `def create_object(keys, values):
    result = {}
    for i in range(len(keys)):
        result[keys[i]] = values[i]
    return result`

function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.keys) || !Array.isArray(input.values) || input.keys.length !== input.values.length) {
    throw new Error('Use an object with keys and values arrays of the same length.')
  }
  return input
}

function buildTrace({ keys, values }) {
  const frames = [{ phase: 'start', activeLine: 2, message: 'Start with an empty object.', at: -1, out: [] }]
  const out = []
  keys.forEach((key, i) => {
    out.push(`${key}: ${JSON.stringify(values[i])}`)
    frames.push({ phase: 'step', activeLine: 4, message: `Set ${key} to ${JSON.stringify(values[i])}.`, at: i, out: [...out] })
  })
  frames.push({ phase: 'done', activeLine: 5, message: 'Every pair is assigned.', at: -1, out: [...out] })
  return { frames }
}

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'The object has no keys yet.' },
    { id: 'step', label: 'Assign', description: 'Assign the value at this position to its key.' },
    { id: 'done', label: 'Result', description: 'The object holds every pair.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with keys and values arrays',
  url: 'https://leetcode.com/problems/create-object-from-two-arrays/',
  complexity: 'O(n) time and O(n) space for n pairs.',
  examples: [
    { label: 'Basic', input: '{"keys":["id","name"],"values":[7,"Ada"]}' },
    { label: 'Repeated key', input: '{"keys":["a","b","a"],"values":[1,2,3]}' },
  ],
}

export default function CreateObjectFromTwoArrays() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Built so far" length={step.out.length} valueAt={i => step.out[i]} active={step.at} />
    <output aria-label="Object so far">{`{ ${step.out.join(', ')} }`}</output>
  </>} renderReasoning={() => <>
    <p>Position i in the keys array and position i in the values array describe one pair.</p>
    <p>A plain loop over the index assigns each pair once. When a key repeats, the later assignment overwrites the earlier value.</p>
  </>} />
}
