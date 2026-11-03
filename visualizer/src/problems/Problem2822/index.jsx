import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'

const code = `invert an object
  result = empty map from value to list of keys
  for each key k with value v
    append k to result[v]
  return result`
const python = `def invert(obj):
    result = {}
    for key, value in obj.items():
        result.setdefault(str(value), []).append(key)
    return result`

function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use a plain object.')
  return input
}

function buildTrace(obj) {
  const keys = Object.keys(obj)
  const result = {}
  const frames = [{ phase: 'start', activeLine: 2, message: 'Start with an empty result.', at: -1, out: [] }]
  const out = []
  keys.forEach((key, i) => {
    const value = String(obj[key])
    result[value] = [...(result[value] || []), key]
    const shown = Object.entries(result).map(([v, ks]) => `${v} → [${ks.join(', ')}]`)
    out.splice(0, out.length, ...shown)
    frames.push({ phase: 'step', activeLine: 4, message: `Key ${key} has value ${value}; file it under ${value}.`, at: i, out: [...out] })
  })
  frames.push({ phase: 'done', activeLine: 5, message: 'Every value now lists the keys that held it.', at: -1, out: [...out] })
  return { frames }
}

const definition = {
  phases: [
    { id: 'start', label: 'Empty', description: 'No values are filed yet.' },
    { id: 'step', label: 'File key', description: 'Add this key under its value.' },
    { id: 'done', label: 'Inverted', description: 'Every value has its key list.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Plain object to invert',
  url: 'https://leetcode.com/problems/inversion-of-object/',
  complexity: 'O(n) expected time for n keys, using a hash map keyed by value.',
  examples: [
    { label: 'Shared value', input: '{"a":1,"b":2,"c":1}' },
    { label: 'All unique', input: '{"x":"p","y":"q"}' },
  ],
}

export default function InversionOfObject() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Inverted buckets" length={step.out.length} valueAt={i => step.out[i]} active={step.at} />
  </>} renderReasoning={() => <>
    <p>Each original key is placed in the bucket named by its value. Two keys with the same value land in the same bucket.</p>
    <p>Values become the lookup keys, so their order and repetition are what the buckets record.</p>
  </>} />
}
