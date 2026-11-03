export const code = [
  'keep a list of collected arguments',
  'for each call add the arguments of this call',
  'if fewer than arity collected return a function to keep waiting',
  'otherwise call fn with all collected arguments and return its value',
].map((text, index) => ({ line: index + 1, text }))
const at = phrase => code.findIndex(c => c.text.includes(phrase)) + 1
function step(frames, phase, line, message, view) { frames.push({ phase, activeLine: at(line), message, view }) }

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Number.isInteger(input.arity) || input.arity < 1 || input.arity > 4) throw new Error('arity is a whole number from 1 to 4.')
  if (!Array.isArray(input.calls) || input.calls.length < 1 || input.calls.length > 6) throw new Error('calls has 1 to 6 argument lists.')
  for (const args of input.calls) {
    if (!Array.isArray(args) || args.length > 3 || !args.every(n => Number.isInteger(n) && Math.abs(n) <= 99)) throw new Error('Each call is up to 3 whole numbers from -99 to 99.')
  }
  return { arity: input.arity, calls: input.calls }
}

// Sample function: the sum of all collected arguments. Result is the value once it fires, or null.
export function buildTrace({ arity, calls }) {
  const frames = []
  const collected = []
  let result = null
  for (let i = 0; i < calls.length && result === null; i++) {
    collected.push(...calls[i])
    const view = (focus, summary) => ({ title: `Collected ${collected.length} of ${arity}`, rows: calls.map((args, index) => `call ${index + 1}: [${args.join(', ')}]`), focus, summary })
    step(frames, 'collect', 'for each call add', `Collected: [${collected.join(', ')}].`, view(i, ''))
    if (collected.length < arity) {
      step(frames, 'wait', 'if fewer than arity', `${collected.length} of ${arity} arguments, so a function is returned to keep waiting.`, view(i, ''))
    } else {
      result = collected.reduce((sum, n) => sum + n, 0)
      step(frames, 'fire', 'otherwise call fn', `Enough arguments, so fn runs and returns ${result}.`, view(i, String(result)))
    }
  }
  if (result === null) step(frames, 'done', 'if fewer than arity', 'Calls ran out before enough arguments arrived.', { title: `Collected ${collected.length} of ${arity}`, rows: calls.map((args, index) => `call ${index + 1}: [${args.join(', ')}]`), focus: -1, summary: 'pending' })
  else step(frames, 'done', 'otherwise call fn', `Final value ${result}.`, { title: 'Result', rows: [String(result)], focus: 0, summary: String(result) })
  return { result, frames }
}
