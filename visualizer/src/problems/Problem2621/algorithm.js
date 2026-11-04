const CODE = [
  'function sleepOrder(durations) {',
  '  const timers = durations.map((ms, index) => ({ index, ms }))',
  '  timers.sort((a, b) => a.ms - b.ms || a.index - b.index)',
  '  const fired = []',
  '  for (const timer of timers) fired.push(timer.index)',
  '  return fired',
  '}',
]

const PY = [
  'def sleep_order(durations):',
  '    timers = [(ms, index) for index, ms in enumerate(durations)]',
  '    timers.sort()',
  '    fired = []',
  '    for ms, index in timers:',
  '        fired.append(index)',
  '    return fired',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Start timers', description: 'All sleeps start at time zero.' },
  { id: 'sort', label: 'Order by time', description: 'Sort by fire time, then start order.' },
  { id: 'fire', label: 'Fire', description: 'Record each timer as it fires.' },
  { id: 'done', label: 'Result', description: 'The completion order.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input.durations) || input.durations.length < 1 || input.durations.length > 8) throw new Error('durations has 1 to 8 values.')
  if (!input.durations.every(ms => Number.isInteger(ms) && ms >= 0 && ms <= 1000)) throw new Error('Each duration is a whole number from 0 to 1000.')
  return { durations: input.durations }
}

export function buildTrace({ durations }) {
  const frames = []
  const timers = durations.map((ms, index) => ({ index, ms }))
  frames.push({ pythonLine: at(PY, 'timers = [(ms, index) for index, ms in enumerate(durations)]'), activeLine: at(CODE, 'const timers = durations.map((ms, index) => ({ index, ms }))'), phase: 'start', message: 'Every sleep starts at time 0.', view: { title: 'Timers', rows: timers.map(t => `timer ${t.index}: ${t.ms} ms`), timers, fired: [], focus: -1, summary: '' } })
  const order = timers.slice().sort((a, b) => a.ms - b.ms || a.index - b.index)
  frames.push({ pythonLine: at(PY, 'timers.sort()'), activeLine: at(CODE, 'timers.sort((a, b) => a.ms - b.ms || a.index - b.index)'), phase: 'sort', message: 'Sorted by fire time, ties by start order.', view: { title: 'Timeline', rows: order.map(t => `${t.ms} ms: timer ${t.index}`), timers, fired: [], focus: -1, summary: '' } })
  order.forEach((timer, k) => frames.push({ pythonLine: at(PY, 'fired.append(index)'), activeLine: at(CODE, 'for (const timer of timers) fired.push(timer.index)'), phase: 'fire', message: `Timer ${timer.index} fires at ${timer.ms} ms.`,
    view: { title: 'Timeline', rows: order.map(t => `${t.ms} ms: timer ${t.index}`), timers, fired: order.slice(0, k + 1).map(t => t.index), focus: k, summary: JSON.stringify(order.slice(0, k + 1).map(t => t.index)) } }))
  const result = order.map(t => t.index)
  frames.push({ pythonLine: at(PY, 'return fired'), activeLine: at(CODE, 'return fired'), phase: 'done', message: 'Completion order recorded.', view: { title: 'Timeline', rows: order.map(t => `${t.ms} ms: timer ${t.index}`), timers, fired: result.slice(), focus: -1, summary: JSON.stringify(result) } })
  return { result, frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
