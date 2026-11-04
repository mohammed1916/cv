export const code = [
  'function cancellable(callback, delay) {',
  '  const timer = setTimeout(callback, delay)',
  '  return function cancel() {',
  '    clearTimeout(timer)',
  '  }',
  '}',
].map((text, index) => ({ line: index + 1, text }))

export const python = `import threading

def cancellable(callback, delay):
    timer = threading.Timer(delay / 1000, callback)
    timer.start()
    def cancel():
        timer.cancel()
    return cancel`

const at = phrase => code.findIndex(c => c.text.includes(phrase)) + 1
const pyAt = phrase => python.split('\n').findIndex(line => line.includes(phrase)) + 1
function step(frames, phase, line, pyLine, message, view) { frames.push({ phase, activeLine: at(line), pythonLine: pyAt(pyLine), message, view }) }

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object') throw new Error('Use an object with delay and cancelAt.')
  if (!Number.isInteger(input.delay) || input.delay < 0 || input.delay > 1000) throw new Error('delay is an integer from 0 to 1000.')
  if (input.cancelAt !== null && (!Number.isInteger(input.cancelAt) || input.cancelAt < 0 || input.cancelAt > 1000)) {
    throw new Error('cancelAt is null or an integer from 0 to 1000.')
  }
  return { delay: input.delay, cancelAt: input.cancelAt }
}

export function buildTrace({ delay, cancelAt }) {
  const frames = []
  const push = (phase, line, pyLine, message, t, status) => frames.push({ phase, activeLine: at(line), pythonLine: pyAt(pyLine), t, status, message })
  push('schedule', 'const timer = setTimeout(callback, delay)', 'timer = threading.Timer', `Schedule the callback for ${delay} ms.`, 0, 'scheduled')
  const cancelled = cancelAt !== null && cancelAt < delay
  if (cancelled) {
    push('cancel', 'clearTimeout(timer)', 'timer.cancel()', `Cancel at ${cancelAt} ms; the timer is cleared and the callback never runs.`, cancelAt, 'cancelled')
  } else {
    push('fire', 'setTimeout(callback, delay)', 'timer.start()', cancelAt === null ? `No cancel; the callback fires at ${delay} ms.` : `The cancel at ${cancelAt} ms came too late, so the callback fired at ${delay} ms.`, delay, 'fired')
  }
  return { input: { delay, cancelAt }, result: cancelled ? 'cancelled' : 'fired', frames }
}
