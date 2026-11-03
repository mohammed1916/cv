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
  if t plus d is later than the cancel time, stop now
  otherwise advance t by d and record the step
report whether the job finished or was cancelled`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ steps, cancelAt }) {
  const frames = []
  const done = []
  let t = 0
  let status = 'running'
  frames.push({ phase: 'start', activeLine: L('run the job'), t, done: [], status, message: `Cancel requested at ${cancelAt} ms.` })
  for (let i = 0; i < steps.length; i++) {
    const d = steps[i]
    if (t + d > cancelAt) {
      status = 'cancelled'
      frames.push({ phase: 'cancel', activeLine: L('if t plus d'), t: cancelAt, done: [...done], status, message: `Step ${i + 1} would end at ${t + d} ms, after the cancel, so it never starts its result.` })
      break
    }
    t += d
    done.push(t)
    frames.push({ phase: 'step', activeLine: L('otherwise advance'), t, done: [...done], status, message: `Step ${i + 1} finishes at ${t} ms.` })
  }
  if (status === 'running') status = 'finished'
  frames.push({ phase: 'done', activeLine: L('report whether'), t, done: [...done], status, message: `The job ${status}.` })
  return { input: { steps, cancelAt }, result: status, frames }
}
