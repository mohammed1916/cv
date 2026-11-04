export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.steps) || input.steps.length < 1 || input.steps.length > 8) {
    throw new Error('Use an object with steps (1 to 8 step durations) and cancelAt (a time).')
  }
  if (!input.steps.every(d => Number.isInteger(d) && d >= 1 && d <= 100)) throw new Error('Each step duration is an integer from 1 to 100.')
  if (!Number.isInteger(input.cancelAt) || input.cancelAt < 0 || input.cancelAt > 1000) throw new Error('cancelAt is an integer from 0 to 1000.')
  return { steps: input.steps, cancelAt: input.cancelAt }
}

export const code = `run the job one timed step at a time
keep the clock t and the list of finished steps
for each step with duration d
  if t plus d is later than the cancel time, throw Cancelled into the job and stop
  otherwise advance t by d and record the step
report the job's return value, or the Cancelled error`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// The job yields one promise per step. Cancel throws the string "Cancelled" into the job at its pending
// yield; with no catch, the returned promise rejects with that string. Otherwise it resolves with the
// value the job returns, which here is the time the last step finished.
export function buildTrace({ steps, cancelAt }) {
  const frames = []
  const done = []
  let t = 0
  let status = 'running'
  frames.push({ phase: 'start', activeLine: L('run the job'), t, done: [], status, cancelAt, message: `Cancel requested at ${cancelAt} ms.` })
  for (let i = 0; i < steps.length; i++) {
    const d = steps[i]
    if (t + d > cancelAt) {
      status = 'cancelled'
      frames.push({ phase: 'cancel', activeLine: L('if t plus d'), t: cancelAt, done: [...done], status, cancelAt, pending: { index: i, from: t, to: t + d }, message: `Step ${i + 1} would end at ${t + d} ms, after the cancel, so "Cancelled" is thrown into the job instead.` })
      break
    }
    t += d
    done.push(t)
    frames.push({ phase: 'step', activeLine: L('otherwise advance'), t, done: [...done], status, cancelAt, message: `Step ${i + 1} finishes at ${t} ms.` })
  }
  if (status === 'running') status = 'finished'
  const result = status === 'cancelled' ? 'Cancelled' : t
  frames.push({ phase: 'done', activeLine: L('report the job'), t, done: [...done], status, cancelAt, result, message: status === 'cancelled' ? 'The promise rejects with "Cancelled".' : `The job returns ${t}, so the promise resolves with ${t}.` })
  return { input: { steps, cancelAt }, result, frames }
}
