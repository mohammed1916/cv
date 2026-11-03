export const code = [
  'start up to limit tasks at time zero',
  'wait for the earliest running task to finish',
  'start the next waiting task at that moment',
  'return the total time once nothing runs or waits',
].map((text, index) => ({ line: index + 1, text }))
const at = phrase => code.findIndex(c => c.text.includes(phrase)) + 1
function step(frames, phase, line, message, view) { frames.push({ phase, activeLine: at(line), message, view }) }

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Number.isInteger(input.limit) || input.limit < 1 || input.limit > 4) throw new Error('limit is a whole number from 1 to 4.')
  if (!Array.isArray(input.durations) || input.durations.length > 8 || !input.durations.every(ms => Number.isInteger(ms) && ms >= 0 && ms <= 500)) throw new Error('durations has at most 8 whole numbers from 0 to 500.')
  return { limit: input.limit, durations: input.durations }
}

export function buildTrace({ limit, durations }) {
  const frames = []
  let now = 0
  let next = 0
  const running = []
  const view = (focus) => ({ title: `Running (limit ${limit})`, rows: running.map(t => `task ${t.index} finishes at ${t.finish}`), focus, summary: `time ${now}` })
  const fill = phrase => {
    while (running.length < limit && next < durations.length) {
      running.push({ index: next, finish: now + durations[next] })
      step(frames, 'start', phrase, `Task ${next} starts at ${now}, ends at ${now + durations[next]}.`, view(running.length - 1))
      next += 1
    }
  }
  if (durations.length === 0) {
    step(frames, 'done', 'return the total time', 'No tasks, so the total time is 0.', view(-1))
    return { result: 0, frames }
  }
  fill('start up to limit')
  while (running.length) {
    running.sort((a, b) => a.finish - b.finish || a.index - b.index)
    const done = running.shift()
    now = done.finish
    step(frames, 'finish', 'wait for the earliest', `Task ${done.index} finishes at ${now}.`, view(-1))
    fill('start the next waiting task')
  }
  step(frames, 'done', 'return the total time', `All tasks are done at ${now}.`, { title: 'Result', rows: [String(now)], focus: 0, summary: `total ${now}` })
  return { result: now, frames }
}
