export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object') throw new Error('Use an object with delay and cancelAt.')
  if (!Number.isInteger(input.delay) || input.delay < 0 || input.delay > 1000) throw new Error('delay is an integer from 0 to 1000.')
  if (input.cancelAt !== null && (!Number.isInteger(input.cancelAt) || input.cancelAt < 0 || input.cancelAt > 1000)) {
    throw new Error('cancelAt is null or an integer from 0 to 1000.')
  }
  return { delay: input.delay, cancelAt: input.cancelAt }
}

export const code = `schedule the callback to run after delay milliseconds
return a cancel function that clears the timer
if cancel is called before the delay ends, the callback never runs
if the delay ends first, the callback runs and later cancels do nothing`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ delay, cancelAt }) {
  const frames = []
  frames.push({ phase: 'schedule', activeLine: L('schedule the callback'), t: 0, status: 'scheduled', message: `Schedule the callback for ${delay} ms.` })
  const cancelled = cancelAt !== null && cancelAt < delay
  if (cancelled) {
    frames.push({ phase: 'cancel', activeLine: L('if cancel is called'), t: cancelAt, status: 'cancelled', message: `Cancel at ${cancelAt} ms; the timer is cleared and the callback never runs.` })
  } else {
    frames.push({ phase: 'fire', activeLine: L('if the delay ends first'), t: delay, status: 'fired', message: cancelAt === null ? `No cancel; the callback fires at ${delay} ms.` : `The cancel at ${cancelAt} ms came too late, so the callback fired at ${delay} ms.` })
  }
  return { input: { delay, cancelAt }, result: cancelled ? 'cancelled' : 'fired', frames }
}
