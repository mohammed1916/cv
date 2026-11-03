export const code = [
  'make a cache keyed by the argument list',
  'build the key from the arguments',
  'if the key is in the cache return the stored value',
  'otherwise call fn and store its value',
  'return the value',
].map((text, index) => ({ line: index + 1, text }))
const at = phrase => code.findIndex(c => c.text.includes(phrase)) + 1
function step(frames, phase, line, message, view) { frames.push({ phase, activeLine: at(line), message, view }) }

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.calls) || input.calls.length < 1 || input.calls.length > 10) throw new Error('calls has 1 to 10 argument lists.')
  for (const args of input.calls) {
    if (!Array.isArray(args) || args.length > 3 || !args.every(n => Number.isInteger(n) && n >= -99 && n <= 99)) throw new Error('Each call is up to 3 whole numbers from -99 to 99.')
  }
  return { calls: input.calls }
}

// The underlying fn is a sum of its arguments; the trace records each real call.
export function buildTrace({ calls }) {
  const frames = []
  const cache = new Map()
  const values = []
  let underlying = 0
  const view = (focus) => ({ title: 'Calls', rows: calls.map((args, index) => `call ${index + 1}: fn(${args.join(', ')})`), focus, summary: `underlying calls: ${underlying}` })
  step(frames, 'start', 'make a cache', 'An empty cache is ready.', view(-1))
  for (let i = 0; i < calls.length; i++) {
    const args = calls[i]
    const key = JSON.stringify(args)
    step(frames, 'key', 'build the key', `Key for call ${i + 1} is ${key}.`, view(i))
    if (cache.has(key)) {
      values.push(cache.get(key))
      step(frames, 'hit', 'if the key is in the cache', `Hit: reuse ${cache.get(key)} without calling fn.`, view(i))
    } else {
      const value = args.reduce((sum, n) => sum + n, 0)
      underlying += 1
      cache.set(key, value)
      values.push(value)
      step(frames, 'miss', 'otherwise call fn', `Miss: fn runs and stores ${value}.`, view(i))
    }
    step(frames, 'return', 'return the value', `Call ${i + 1} answers ${values[i]}.`, view(i))
  }
  step(frames, 'done', 'return the value', `Finished with ${underlying} underlying calls.`, view(-1))
  return { result: { values, underlyingCalls: underlying }, frames }
}
