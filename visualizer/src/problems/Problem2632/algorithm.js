const CODE = [
  'function curry(fn, arity) {',
  '  const collected = []',
  '  return function step(...args) {',
  '    collected.push(...args)',
  '    if (collected.length < arity) return step',
  '    return fn(...collected)',
  '  }',
  '}',
]

const PY = [
  'def curry(fn, arity):',
  '    collected = []',
  '    def step(*args):',
  '        collected.extend(args)',
  '        if len(collected) < arity:',
  '            return step',
  '        return fn(*collected)',
  '    return step',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'collect', label: 'Collect', description: 'Add this call arguments to the list.' },
  { id: 'wait', label: 'Wait', description: 'Not enough arguments yet.' },
  { id: 'fire', label: 'Fire', description: 'Enough arguments, so fn runs.' },
  { id: 'done', label: 'Result', description: 'Final outcome.' },
]

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
    const view = (focus, summary) => ({ title: `Collected ${collected.length} of ${arity}`, rows: calls.map((args, index) => `call ${index + 1}: [${args.join(', ')}]`), calls: calls.map(args => args.slice()), collected: collected.slice(), arity, focus, summary })
    frames.push({ pythonLine: at(PY, 'collected.extend(args)'), activeLine: at(CODE, 'collected.push(...args)'), phase: 'collect', message: `Collected: [${collected.join(', ')}].`, view: view(i, '') })
    if (collected.length < arity) {
      frames.push({ pythonLine: at(PY, 'return step'), activeLine: at(CODE, 'if (collected.length < arity) return step'), phase: 'wait', message: `${collected.length} of ${arity} arguments, so a function is returned to keep waiting.`, view: view(i, '') })
    } else {
      result = collected.reduce((sum, n) => sum + n, 0)
      frames.push({ pythonLine: at(PY, 'return fn(*collected)'), activeLine: at(CODE, 'return fn(...collected)'), phase: 'fire', message: `Enough arguments, so fn runs and returns ${result}.`, view: view(i, String(result)) })
    }
  }
  const rows = calls.map((args, index) => `call ${index + 1}: [${args.join(', ')}]`)
  if (result === null) frames.push({ pythonLine: at(PY, 'return step'), activeLine: at(CODE, 'if (collected.length < arity) return step'), phase: 'done', message: 'Calls ran out before enough arguments arrived.', view: { title: `Collected ${collected.length} of ${arity}`, rows, calls: calls.map(args => args.slice()), collected: collected.slice(), arity, focus: -1, summary: 'pending' } })
  else frames.push({ pythonLine: at(PY, 'return fn(*collected)'), activeLine: at(CODE, 'return fn(...collected)'), phase: 'done', message: `Final value ${result}.`, view: { title: 'Result', rows: [String(result)], calls: calls.map(args => args.slice()), collected: collected.slice(), arity, focus: 0, summary: String(result) } })
  return { result, frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
