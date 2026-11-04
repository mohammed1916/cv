export const code = [
  'function poolTotalTime(limit, durations) {',
  '  let now = 0',
  '  let next = 0',
  '  const running = []',
  '  const start = () => { running.push(now + durations[next]); next++ }',
  '  while (running.length < limit && next < durations.length) start()',
  '  while (running.length) {',
  '    running.sort((a, b) => a - b)',
  '    now = running.shift()',
  '    while (running.length < limit && next < durations.length) start()',
  '  }',
  '  return now',
  '}',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def pool_total_time(limit, durations):
    now = 0
    nxt = 0
    running = []
    def start():
        nonlocal nxt
        running.append(now + durations[nxt])
        nxt += 1
    while len(running) < limit and nxt < len(durations):
        start()
    while running:
        running.sort()
        now = running.pop(0)
        while len(running) < limit and nxt < len(durations):
            start()
    return now`

const at = phrase => code.findIndex(c => c.text.includes(phrase)) + 1
const pyAt = phrase => python.split('\n').findIndex(line => line.includes(phrase)) + 1

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
  const bars = [] // every task that has started: its slot in the pool, start and finish times
  const view = (focus) => ({ title: `Running (limit ${limit})`, rows: running.map(t => `task ${t.index} finishes at ${t.finish}`), running: running.map(t => ({ ...t })), bars: bars.map(b => ({ ...b })), limit, now, focus, summary: `time ${now}` })
  const push = (phase, line, pyLine, message, focus) => frames.push({ phase, activeLine: at(line), pythonLine: pyAt(pyLine), message, view: view(focus) })
  const fill = (line, pyLine) => {
    while (running.length < limit && next < durations.length) {
      const slot = Math.min(...Array.from({ length: limit }, (_, s) => s).filter(s => !running.some(t => t.slot === s)))
      const task = { index: next, slot, start: now, finish: now + durations[next] }
      running.push(task)
      bars.push({ ...task })
      push('start', line, pyLine, `Task ${next} starts at ${now}, ends at ${now + durations[next]}.`, running.length - 1)
      next += 1
    }
  }
  if (durations.length === 0) {
    push('done', 'return now', 'return now', 'No tasks, so the total time is 0.', -1)
    return { result: 0, frames, input: { limit, durations } }
  }
  fill('while (running.length < limit && next < durations.length) start()', 'while len(running) < limit')
  while (running.length) {
    running.sort((a, b) => a.finish - b.finish || a.index - b.index)
    const done = running.shift()
    now = done.finish
    push('finish', 'now = running.shift()', 'now = running.pop(0)', `Task ${done.index} finishes at ${now}.`, -1)
    fill('now = running.shift()', 'running.pop(0)')
  }
  frames.push({ phase: 'done', activeLine: at('return now'), pythonLine: pyAt('return now'), message: `All tasks are done at ${now}.`, view: { ...view(-1), title: 'Result', rows: [String(now)], focus: 0, summary: `total ${now}` } })
  return { result: now, frames, input: { limit, durations } }
}
