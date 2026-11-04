export const code = [
  'function expect(value) {',
  '  return {',
  '    toBe(expected) {',
  '      if (value !== expected) throw new Error("Not Equal")',
  '      return true',
  '    },',
  '    notToBe(expected) {',
  '      if (value === expected) throw new Error("Equal")',
  '      return true',
  '    },',
  '  }',
  '}',
].map((text, index) => ({ line: index + 1, text }))

export const python = `def same(a, b):
    return type(a) is type(b) and a == b

class Expect:
    def __init__(self, value):
        self.value = value
    def to_be(self, expected):
        if not same(self.value, expected):
            raise AssertionError("Not Equal")
        return True
    def not_to_be(self, expected):
        if same(self.value, expected):
            raise AssertionError("Equal")
        return True`

const at = phrase => code.findIndex(c => c.text.includes(phrase)) + 1
const pyAt = phrase => python.split('\n').findIndex(line => line.includes(phrase)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !('value' in input) || !Array.isArray(input.checks) || input.checks.length > 8) {
    throw new Error('Use an object with value and checks, a list of at most 8 [method, expected] pairs.')
  }
  if (!['number', 'string', 'boolean'].includes(typeof input.value)) throw new Error('value is a number, string or boolean.')
  for (const check of input.checks) {
    if (!Array.isArray(check) || !['toBe', 'notToBe'].includes(check[0]) || !['number', 'string', 'boolean'].includes(typeof check[1])) {
      throw new Error('Each check is ["toBe" or "notToBe", expected value].')
    }
  }
  return { value: input.value, checks: input.checks }
}

export function buildTrace({ value, checks }) {
  const frames = []
  const results = []
  frames.push({ phase: 'start', activeLine: at('function expect(value)'), pythonLine: pyAt('class Expect:'), value, results: [], message: `expect(${JSON.stringify(value)}) returns the checker.` })
  for (const [method, expected] of checks) {
    const same = value === expected
    const pass = method === 'toBe' ? same : !same
    const label = `${method}(${JSON.stringify(expected)})`
    results.push({ label, pass: pass ? 'true' : 'throws' })
    frames.push({
      phase: 'check',
      activeLine: at(method === 'toBe' ? 'toBe(expected) {' : 'notToBe(expected) {'),
      pythonLine: pyAt(method === 'toBe' ? 'def to_be' : 'def not_to_be'),
      value,
      results: [...results],
      message: pass ? `${label} passes and returns true.` : `${label} throws ${method === 'toBe' ? 'Not Equal' : 'Equal'}.`,
    })
  }
  frames.push({ phase: 'done', activeLine: at('return true'), pythonLine: pyAt('return True'), value, results: [...results], message: 'All checks were evaluated.' })
  return { input: { value, checks }, result: results.map(r => r.pass), frames }
}
