import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'

const code = `simulate a repeating timer
  next = delay
  while next is at or before the stop time
    fire the callback at next
    next = next + delay
  return the list of fire times`
const python = `def fire_times(delay, stop_at):
    times = []
    t = delay
    while t <= stop_at:
        times.append(t)
        t += delay
    return times`

function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Number.isInteger(input.delay) || input.delay <= 0 || !Number.isInteger(input.stopAt) || input.stopAt < 0) {
    throw new Error('Use { "delay": positive integer, "stopAt": non-negative integer }.')
  }
  return input
}

function buildTrace({ delay, stopAt }) {
  const out = []
  const frames = [{ phase: 'start', activeLine: 2, message: `Schedule the first tick at ${delay} ms.`, at: -1, out: [] }]
  for (let t = delay; t <= stopAt; t += delay) {
    out.push(`${t} ms`)
    frames.push({ phase: 'step', activeLine: 5, message: `Fire at ${t} ms, then schedule ${t + delay} ms.`, at: out.length - 1, out: [...out] })
  }
  frames.push({ phase: 'done', activeLine: 6, message: `${out.length} tick(s) before ${stopAt} ms.`, at: -1, out: [...out] })
  return { frames }
}

const definition = {
  phases: [
    { id: 'start', label: 'Schedule', description: 'Plan the first tick.' },
    { id: 'step', label: 'Tick', description: 'Fire and schedule the next tick.' },
    { id: 'done', label: 'Clear', description: 'Stop when the next tick passes the stop time.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with delay and stopAt in milliseconds',
  url: 'https://leetcode.com/problems/custom-interval/',
  complexity: 'O(stopAt / delay) ticks in this simulation.',
  examples: [
    { label: 'Every 50 ms', input: '{"delay":50,"stopAt":200}' },
    { label: 'Slow', input: '{"delay":300,"stopAt":700}' },
  ],
}

export default function CustomInterval() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <IndexedSequence label="Fire times" length={step.out.length} valueAt={i => step.out[i]} active={step.at} />
  </>} renderReasoning={() => <>
    <p>A repeating timer is a chain: each fire schedules exactly one future fire.</p>
    <p>The chain stops when the next scheduled time is past the stop time or the timer is cleared.</p>
  </>} />
}
