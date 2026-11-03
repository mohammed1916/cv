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

export const code = `expect(value) returns an object with toBe and notToBe
toBe(expected) throws Not Equal when value is not strictly equal to expected
notToBe(expected) throws Equal when value is strictly equal to expected
otherwise the check returns true`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ value, checks }) {
  const frames = []
  const results = []
  frames.push({ phase: 'start', activeLine: L('expect(value)'), value, results: [], message: `expect(${JSON.stringify(value)}) returns the checker.` })
  for (const [method, expected] of checks) {
    const same = value === expected
    const pass = method === 'toBe' ? same : !same
    const label = `${method}(${JSON.stringify(expected)})`
    results.push({ label, pass: pass ? 'true' : 'throws' })
    frames.push({
      phase: 'check', activeLine: L(method === 'toBe' ? 'toBe(expected)' : 'notToBe(expected)'), value, results: [...results],
      message: pass ? `${label} passes and returns true.` : `${label} throws ${method === 'toBe' ? 'Not Equal' : 'Equal'}.`,
    })
  }
  frames.push({ phase: 'done', activeLine: L('otherwise the check'), value, results: [...results], message: 'All checks were evaluated.' })
  return { input: { value, checks }, result: results.map(r => r.pass), frames }
}
