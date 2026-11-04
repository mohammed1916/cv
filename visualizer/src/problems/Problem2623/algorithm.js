const CODE = [
  'function memoize(fn) {',
  '  const cache = new Map()',
  '  return function (...args) {',
  '    const key = JSON.stringify(args)',
  '    if (cache.has(key)) return cache.get(key)',
  '    const value = fn(...args)',
  '    cache.set(key, value)',
  '    return value',
  '  }',
  '}',
]

const PY = [
  'def memoize(fn):',
  '    cache = {}',
  '    def wrapped(*args):',
  '        key = tuple(args)',
  '        if key in cache:',
  '            return cache[key]',
  '        value = fn(*args)',
  '        cache[key] = value',
  '        return value',
  '    return wrapped',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Start', description: 'Create an empty cache.' },
  { id: 'key', label: 'Key', description: 'Turn the arguments into a key.' },
  { id: 'hit', label: 'Hit', description: 'Reuse a stored answer.' },
  { id: 'miss', label: 'Miss', description: 'Run the function and store it.' },
  { id: 'return', label: 'Return', description: 'Answer this call.' },
  { id: 'done', label: 'Result', description: 'Totals.' },
]

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
  const outcomes = []
  let underlying = 0
  const view = (focus) => ({ title: 'Calls', rows: calls.map((args, index) => `call ${index + 1}: fn(${args.join(', ')})`), calls: calls.map(args => args.slice()), outcomes: outcomes.slice(), focus, entries: [...cache.entries()].map(([key, value]) => ({ key, value })), underlying, summary: `underlying calls: ${underlying}` })
  frames.push({ pythonLine: at(PY, 'cache = {}'), activeLine: at(CODE, 'const cache = new Map()'), phase: 'start', message: 'An empty cache is ready.', view: view(-1) })
  for (let i = 0; i < calls.length; i++) {
    const args = calls[i]
    const key = JSON.stringify(args)
    frames.push({ pythonLine: at(PY, 'key = tuple(args)'), activeLine: at(CODE, 'const key = JSON.stringify(args)'), phase: 'key', message: `Key for call ${i + 1} is ${key}.`, view: view(i) })
    if (cache.has(key)) {
      values.push(cache.get(key))
      outcomes.push('hit')
      frames.push({ pythonLine: at(PY, 'if key in cache:'), activeLine: at(CODE, 'if (cache.has(key)) return cache.get(key)'), phase: 'hit', message: `Hit: reuse ${cache.get(key)} without calling fn.`, view: view(i) })
    } else {
      const value = args.reduce((sum, n) => sum + n, 0)
      underlying += 1
      cache.set(key, value)
      values.push(value)
      outcomes.push('miss')
      frames.push({ pythonLine: at(PY, 'value = fn(*args)'), activeLine: at(CODE, 'const value = fn(...args)'), phase: 'miss', message: `Miss: fn runs and stores ${value}.`, view: view(i) })
    }
    frames.push({ pythonLine: at(PY, 'return value'), activeLine: at(CODE, 'return value'), phase: 'return', message: `Call ${i + 1} answers ${values[i]}.`, view: view(i) })
  }
  frames.push({ pythonLine: at(PY, 'return wrapped'), activeLine: at(CODE, '}'), phase: 'done', message: `Finished with ${underlying} underlying calls.`, view: view(-1) })
  return { result: { values, underlyingCalls: underlying }, frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
