const CODE = [
  'function runWithCancel(steps, cancelAt) {',
  '  let t = 0',
  '  for (const d of steps) {',
  '    if (t + d > cancelAt) throw "Cancelled"',
  '    t += d',
  '  }',
  '  return t',
  '}',
]

const PY = [
  'def run_with_cancel(steps, cancel_at):',
  '    t = 0',
  '    for d in steps:',
  '        if t + d > cancel_at:',
  '            raise Exception("Cancelled")',
  '        t += d',
  '    return t',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Start', description: 'The job begins at time zero.' },
  { id: 'step', label: 'Step', description: 'A step finishes before the cancel time.' },
  { id: 'cancel', label: 'Cancel', description: 'The next step would finish too late.' },
  { id: 'done', label: 'Result', description: 'Report the outcome.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.steps) || input.steps.length < 1 || input.steps.length > 8) {
    throw new Error('Use an object with steps (1 to 8 step durations) and cancelAt (a time).')
  }
  if (!input.steps.every(d => Number.isInteger(d) && d >= 1 && d <= 100)) throw new Error('Each step duration is an integer from 1 to 100.')
  if (!Number.isInteger(input.cancelAt) || input.cancelAt < 0 || input.cancelAt > 1000) throw new Error('cancelAt is an integer from 0 to 1000.')
  return { steps: input.steps, cancelAt: input.cancelAt }
}

// The job yields one promise per step. Cancel throws the string "Cancelled" into the job at its pending
// yield; with no catch, the returned promise rejects with that string. Otherwise it resolves with the
// value the job returns, which here is the time the last step finished.
export function buildTrace({ steps, cancelAt }) {
  const frames = []
  const done = []
  let t = 0
  let status = 'running'
  frames.push({ pythonLine: at(PY, 't = 0'), activeLine: at(CODE, 'let t = 0'), phase: 'start', t, done: [], status, cancelAt, message: `Cancel requested at ${cancelAt} ms.` })
  for (let i = 0; i < steps.length; i++) {
    const d = steps[i]
    if (t + d > cancelAt) {
      status = 'cancelled'
      frames.push({ pythonLine: at(PY, 'if t + d > cancel_at:'), activeLine: at(CODE, 'if (t + d > cancelAt) throw "Cancelled"'), phase: 'cancel', t: cancelAt, done: [...done], status, cancelAt, pending: { index: i, from: t, to: t + d }, message: `Step ${i + 1} would end at ${t + d} ms, after the cancel, so "Cancelled" is thrown into the job instead.` })
      break
    }
    t += d
    done.push(t)
    frames.push({ pythonLine: at(PY, 't += d'), activeLine: at(CODE, 't += d'), phase: 'step', t, done: [...done], status, cancelAt, message: `Step ${i + 1} finishes at ${t} ms.` })
  }
  if (status === 'running') status = 'finished'
  const result = status === 'cancelled' ? 'Cancelled' : t
  frames.push({ pythonLine: at(PY, 'return t'), activeLine: at(CODE, 'return t'), phase: 'done', t, done: [...done], status, cancelAt, result, message: status === 'cancelled' ? 'The promise rejects with "Cancelled".' : `The job returns ${t}, so the promise resolves with ${t}.` })
  return { input: { steps, cancelAt }, result, frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
