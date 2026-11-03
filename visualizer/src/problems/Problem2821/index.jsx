import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'

const code = `delay a promise resolution
  create a timer for ms milliseconds
  when the timer fires
    resolve with the same value
  return the promise`
const python = `def delay_resolution(value, ms):
    # simulated clock: the result is available at time ms
    return {"value": value, "resolves_at": ms}`

function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Number.isInteger(input.ms) || input.ms < 0 || !('value' in input)) {
    throw new Error('Use { "value": any JSON value, "ms": non-negative integer }.')
  }
  return input
}

function buildTrace({ value, ms }) {
  const frames = [{ phase: 'start', activeLine: 2, message: `Start a ${ms} ms timer; the promise is pending.`, at: -1, out: ['pending'] }]
  frames.push({ phase: 'step', activeLine: 4, message: `At ${ms} ms the timer fires and resolves with ${JSON.stringify(value)}.`, at: 0, out: [JSON.stringify(value)] })
  frames.push({ phase: 'done', activeLine: 5, message: 'The promise is returned with the same value, only later.', at: -1, out: [JSON.stringify(value)] })
  return { frames }
}

const definition = {
  phases: [
    { id: 'start', label: 'Pending', description: 'The timer is running.' },
    { id: 'step', label: 'Resolve', description: 'The timer resolves the promise.' },
    { id: 'done', label: 'Result', description: 'The value is delivered.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with value and ms',
  url: 'https://leetcode.com/problems/delay-the-resolution-of-each-promise/',
  complexity: 'O(1) work plus one timer of ms milliseconds.',
  examples: [
    { label: 'Short delay', input: '{"value":"ready","ms":40}' },
    { label: 'Number', input: '{"value":42,"ms":120}' },
  ],
}

export default function DelayPromiseResolution() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Promise state" length={step.out.length} valueAt={i => step.out[i]} active={step.at} />
  </>} renderReasoning={() => <>
    <p>The wrapper does not change the value. It only moves the moment the value is delivered.</p>
    <p>Until the timer fires, the promise stays pending and anything waiting on it waits too.</p>
  </>} />
}
