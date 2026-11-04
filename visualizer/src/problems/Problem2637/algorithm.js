export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with delay, limit and value.')
  const { delay, limit, value } = input
  if (!Number.isInteger(delay) || delay < 0 || delay > 500) throw new Error('delay is an integer from 0 to 500.')
  if (!Number.isInteger(limit) || limit < 0 || limit > 500) throw new Error('limit is an integer from 0 to 500.')
  if (typeof value !== 'string' || value.length > 20) throw new Error('value is a string of at most 20 characters.')
  return { delay, limit, value }
}

export const code = `race a task against a timer for the limit
start the task and the limit timer together
wait while neither has settled
if the task finishes first, resolve with its value
otherwise reject with Time Limit Exceeded`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ delay, limit, value }) {
  const frames = []
  const end = Math.min(delay, limit)
  frames.push({ phase: 'start', activeLine: L('start the task'), t: 0, outcome: null, message: 'Start the task and the limit timer together.' })
  for (let t = 10; t < end; t += 10) frames.push({ phase: 'wait', activeLine: L('wait while'), t, outcome: null, message: `At ${t} ms neither has settled.` })
  const ok = delay <= limit
  frames.push({
    phase: ok ? 'resolve' : 'reject', activeLine: L(ok ? 'resolve with its value' : 'otherwise reject'), t: end,
    outcome: ok ? 'resolved' : 'rejected',
    message: ok ? `The task finishes at ${delay} ms, before the limit, so it resolves with "${value}".` : `The limit fires at ${limit} ms first, so the promise rejects.`,
  })
  for (const frame of frames) { frame.delay = delay; frame.limit = limit }
  return { input: { delay, limit, value }, result: ok ? value : 'Time Limit Exceeded', frames }
}
