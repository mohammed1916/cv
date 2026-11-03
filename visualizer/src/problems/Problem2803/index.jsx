import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'

const code = `yield factorial values one at a time
  current = 1
  for k from 1 to count
    current = current * k
    yield current`
const python = `def factorial_generator(count):
    current = 1
    for k in range(1, count + 1):
        current *= k
        yield current`

function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Number.isInteger(input.count) || input.count < 0 || input.count > 12) {
    throw new Error('Use { "count": n } with n from 0 to 12.')
  }
  return input
}

function buildTrace({ count }) {
  const out = []
  let current = 1
  const frames = [{ phase: 'start', activeLine: 2, message: 'The running product starts at 1.', at: -1, out: [] }]
  for (let k = 1; k <= count; k++) {
    current *= k
    out.push(String(current))
    frames.push({ phase: 'step', activeLine: 5, message: `Multiply by ${k}: yield ${current}.`, at: out.length - 1, out: [...out] })
  }
  frames.push({ phase: 'done', activeLine: 5, message: `${out.length} value(s) yielded.`, at: -1, out: [...out] })
  return { frames }
}

const definition = {
  phases: [
    { id: 'start', label: 'Seed', description: 'Start the running product.' },
    { id: 'step', label: 'Yield', description: 'Multiply and yield the next value.' },
    { id: 'done', label: 'Finished', description: 'The requested values are produced.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with count (number of values to produce)',
  url: 'https://leetcode.com/problems/factorial-generator/',
  complexity: 'O(count) multiplications in total, one per yielded value.',
  examples: [
    { label: 'Five values', input: '{"count":5}' },
    { label: 'Three values', input: '{"count":3}' },
  ],
}

export default function FactorialGenerator() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Yielded values" length={step.out.length} valueAt={i => step.out[i]} active={step.at} />
  </>} renderReasoning={() => <>
    <p>Each yield reuses the previous product, so the generator holds only one number between steps.</p>
    <p>Computing the next value is one multiplication, not a fresh loop from 1.</p>
  </>} />
}
