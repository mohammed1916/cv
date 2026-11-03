export const code = [
  'start one timer per duration at time zero',
  'sort the timers by the time they fire',
  'equal times keep their start order',
  'record the index of each timer as it fires',
  'return the recorded order',
].map((text, index) => ({ line: index + 1, text }))
const at = phrase => code.findIndex(c => c.text.includes(phrase)) + 1
function step(frames, phase, line, message, view) { frames.push({ phase, activeLine: at(line), message, view }) }

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input.durations) || input.durations.length < 1 || input.durations.length > 8) throw new Error('durations has 1 to 8 values.')
  if (!input.durations.every(ms => Number.isInteger(ms) && ms >= 0 && ms <= 1000)) throw new Error('Each duration is a whole number from 0 to 1000.')
  return { durations: input.durations }
}

export function buildTrace({ durations }) {
  const frames = []
  const timers = durations.map((ms, index) => ({ index, ms }))
  step(frames, 'start', 'start one timer', 'Every sleep starts at time 0.', { title: 'Timers', rows: timers.map(t => `timer ${t.index}: ${t.ms} ms`), focus: -1, summary: '' })
  const order = timers.slice().sort((a, b) => a.ms - b.ms || a.index - b.index)
  step(frames, 'sort', 'sort the timers', 'Sorted by fire time, ties by start order.', { title: 'Timeline', rows: order.map(t => `${t.ms} ms: timer ${t.index}`), focus: -1, summary: '' })
  order.forEach((timer, k) => step(frames, 'fire', 'record the index', `Timer ${timer.index} fires at ${timer.ms} ms.`,
    { title: 'Timeline', rows: order.map(t => `${t.ms} ms: timer ${t.index}`), focus: k, summary: JSON.stringify(order.slice(0, k + 1).map(t => t.index)) }))
  const result = order.map(t => t.index)
  step(frames, 'done', 'return the recorded order', 'Completion order recorded.', { title: 'Timeline', rows: order.map(t => `${t.ms} ms: timer ${t.index}`), focus: -1, summary: JSON.stringify(result) })
  return { result, frames }
}
