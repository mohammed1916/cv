const JS = [
  'function repeatString(str, times) {',
  "  let result = ''",
  '  for (let k = 0; k < times; k++) {',
  '    result += str',
  '  }',
  '  return result',
  '}',
]
export const code = JS.map((text, index) => ({ line: index + 1, text }))
const L = s => JS.findIndex(t => t.includes(s)) + 1

const PY = `def repeat_string(text, times):
    result = ""
    for _ in range(times):
        result += text
    return result`
export const python = PY
const P = s => PY.split('\n').findIndex(t => t.includes(s)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input.str !== 'string' || !Number.isInteger(input.times) || input.times < 0) {
    throw new Error('Use { "str": "...", "times": n } with n a non-negative integer.')
  }
  return { str: input.str, times: input.times }
}

export function buildTrace({ str, times }) {
  const chunks = []
  const frames = [{ phase: 'start', activeLine: L("let result"), pythonLine: P('result = ""'), message: `Repeat "${str}" ${times} time(s). The result starts empty.`, at: -1, out: [] }]
  for (let k = 0; k < times; k++) {
    chunks.push(str)
    frames.push({ phase: 'step', activeLine: L('result +='), pythonLine: P('result +='), message: `Append copy ${k + 1} of "${str}".`, at: k, out: [...chunks] })
  }
  const result = chunks.join('')
  frames.push({ phase: 'done', activeLine: L('return result'), pythonLine: P('return result'), message: `Result: "${result}".`, at: -1, out: [...chunks] })
  return { input: { str, times }, result, frames }
}
