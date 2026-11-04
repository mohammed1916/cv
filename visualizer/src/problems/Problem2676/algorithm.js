export const code = [
  'function throttleRuns(wait, calls) {',
  '  const runs = []',
  '  let lastRun = -Infinity',
  '  let pendingAt = null',
  '  const runAt = t => { runs.push(t); lastRun = t; pendingAt = null }',
  '  for (const t of calls) {',
  '    while (pendingAt !== null && pendingAt <= t) runAt(pendingAt)',
  '    if (t - lastRun >= wait) runAt(t)',
  '    else pendingAt = lastRun + wait',
  '  }',
  '  if (pendingAt !== null) runAt(pendingAt)',
  '  return runs',
  '}',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def throttle_runs(wait, calls):
    runs = []
    last_run = float("-inf")
    pending_at = None

    def run_at(t):
        nonlocal last_run, pending_at
        runs.append(t)
        last_run = t
        pending_at = None

    for t in calls:
        while pending_at is not None and pending_at <= t:
            run_at(pending_at)
        if t - last_run >= wait:
            run_at(t)
        else:
            pending_at = last_run + wait
    if pending_at is not None:
        run_at(pending_at)
    return runs`

const at = phrase => code.findIndex(c => c.text.includes(phrase)) + 1
const pyAt = phrase => python.split('\n').findIndex(line => line.includes(phrase)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Number.isInteger(input.wait) || input.wait < 1 || input.wait > 500) {
    throw new Error('Use an object with wait, an integer from 1 to 500.')
  }
  const calls = input.calls
  if (!Array.isArray(calls) || calls.length > 8 || !calls.every(t => Number.isInteger(t) && t >= 0 && t <= 1000)) {
    throw new Error('calls is a list of at most 8 call times from 0 to 1000.')
  }
  for (let i = 1; i < calls.length; i++) if (calls[i] < calls[i - 1]) throw new Error('calls must be in ascending order.')
  return { wait: input.wait, calls }
}

export function buildTrace({ wait, calls }) {
  const frames = []
  const runs = []
  let lastRun = -Infinity
  let pendingAt = null
  const runAt = (t, line, pyLine) => {
    runs.push(t)
    lastRun = t
    pendingAt = null
    frames.push({ phase: 'run', activeLine: at(line), pythonLine: pyAt(pyLine), t, runs: [...runs], pendingAt, message: `Run the function at ${t} ms.` })
  }
  frames.push({ phase: 'start', activeLine: at('function throttleRuns'), pythonLine: pyAt('def throttle_runs'), t: 0, runs: [], pendingAt: null, message: `The window is ${wait} ms.` })
  for (const t of calls) {
    while (pendingAt !== null && pendingAt <= t) runAt(pendingAt, 'while (pendingAt !== null', 'while pending_at is not None')
    frames.push({ phase: 'call', activeLine: at('for (const t of calls)'), pythonLine: pyAt('for t in calls:'), t, runs: [...runs], pendingAt, message: `A call arrives at ${t} ms.` })
    if (t - lastRun >= wait) runAt(t, 'if (t - lastRun >= wait)', 'if t - last_run >= wait:')
    else {
      pendingAt = lastRun + wait
      frames.push({ phase: 'queue', activeLine: at('else pendingAt = lastRun'), pythonLine: pyAt('pending_at = last_run + wait'), t, runs: [...runs], pendingAt, message: `Inside the window; the latest call waits until ${pendingAt} ms.` })
    }
  }
  if (pendingAt !== null) runAt(pendingAt, 'if (pendingAt !== null) runAt', 'if pending_at is not None:')
  frames.push({ phase: 'done', activeLine: at('return runs'), pythonLine: pyAt('return runs'), t: lastRun, runs: [...runs], pendingAt: null, message: `The function ran ${runs.length} time${runs.length === 1 ? '' : 's'}.` })
  return { input: { wait, calls }, result: runs, frames }
}
