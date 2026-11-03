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

export const code = `throttle a function so it runs at most once per wait
keep the time of the last run and one pending call
on each call at time t
  first run any pending call whose window has ended
  if t is at least wait after the last run, run now
  otherwise keep this call as the pending one
after the last call, run any remaining pending call`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ wait, calls }) {
  const frames = []
  const runs = []
  let lastRun = -Infinity
  let pendingAt = null
  const runAt = (t, why) => {
    runs.push(t)
    lastRun = t
    pendingAt = null
    frames.push({ phase: 'run', activeLine: L(why), t, runs: [...runs], pendingAt, message: `Run the function at ${t} ms.` })
  }
  frames.push({ phase: 'start', activeLine: L('throttle a function'), t: 0, runs: [], pendingAt: null, message: `The window is ${wait} ms.` })
  for (const t of calls) {
    while (pendingAt !== null && pendingAt <= t) runAt(pendingAt, 'run any pending')
    frames.push({ phase: 'call', activeLine: L('on each call'), t, runs: [...runs], pendingAt, message: `A call arrives at ${t} ms.` })
    if (t - lastRun >= wait) runAt(t, 'if t is at least')
    else {
      pendingAt = lastRun + wait
      frames.push({ phase: 'queue', activeLine: L('otherwise keep'), t, runs: [...runs], pendingAt, message: `Inside the window; the latest call waits until ${pendingAt} ms.` })
    }
  }
  if (pendingAt !== null) runAt(pendingAt, 'run any remaining')
  frames.push({ phase: 'done', activeLine: L('after the last call'), t: lastRun, runs: [...runs], pendingAt: null, message: `The function ran ${runs.length} time${runs.length === 1 ? '' : 's'}.` })
  return { input: { wait, calls }, result: runs, frames }
}
