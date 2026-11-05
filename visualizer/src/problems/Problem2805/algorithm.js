export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Number.isInteger(input.delay) || !Number.isInteger(input.period) || !Number.isInteger(input.cancelTime)) {
    throw new Error('Use an object with integer delay, period and cancelTime, for example {"delay":50,"period":20,"cancelTime":225}.')
  }
  if (input.delay < 20 || input.delay > 250 || input.period < 20 || input.period > 250) throw new Error('delay and period are from 20 to 250.')
  if (input.cancelTime < 0 || input.cancelTime > 1000) throw new Error('cancelTime is from 0 to 1000 milliseconds.')
  return { delay: input.delay, period: input.period, cancelTime: input.cancelTime }
}

export const code = `let count <- 0, now <- 0
function schedule()
  wait <- delay + period * count
  timer <- setTimeout after wait milliseconds:
    fn(), count <- count + 1, then schedule() again
customInterval(fn, delay, period)
  schedule() and RETURN an id for the chain
customClearInterval(id) cancels the pending timer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def custom_interval_times(delay, period, cancel_time):
    times, now, count = [], 0, 0
    while True:
        now += delay + period * count
        if now > cancel_time:
            break
        times.append(now)
        count += 1
    return times
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

// Each firing waits delay + period * count after the previous one, so the times are cumulative.
export function buildTrace({ delay, period, cancelTime }) {
  const frames = []
  const times = []
  let now = 0, count = 0
  frames.push({ phase: 'start', activeLine: CL('let count'), pythonLine: PL('times, now, count'), now, count, wait: null, fired: [], cancelTime, message: `Schedule the first call after ${delay} ms.` })
  for (;;) {
    const wait = delay + period * count
    now += wait
    if (now > cancelTime) {
      frames.push({ phase: 'cancel', activeLine: CL('customClearInterval'), pythonLine: PL('break'), now: cancelTime, count, wait, fired: [...times], cancelTime, message: `The next call would be at ${now} ms, after the cancel at ${cancelTime} ms, so it never runs.` })
      break
    }
    times.push(now)
    frames.push({ phase: 'fire', activeLine: CL('fn(), count'), pythonLine: PL('times.append(now)'), now, count, wait, fired: [...times], cancelTime, message: `Call ${count + 1} runs at ${now} ms (waited ${wait} ms).` })
    count += 1
  }
  frames.push({ phase: 'done', activeLine: CL('customClearInterval'), pythonLine: PL('return times'), now: cancelTime, count, wait: null, fired: [...times], cancelTime, result: [...times], message: `${times.length} call${times.length === 1 ? '' : 's'} ran before the cancel.` })
  return { input: { delay, period, cancelTime }, result: [...times], frames }
}
