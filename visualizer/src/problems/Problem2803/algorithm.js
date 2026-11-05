export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Number.isInteger(input.n) || input.n < 0 || input.n > 10) throw new Error('n is an integer from 0 to 10, for example {"n":4}.')
  return { n: input.n }
}

export const code = `function* factorial(n)
  if n equals 0, yield 1
  ans <- 1
  for i from 1 to n
    ans <- ans * i
    yield ans`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def factorial(n):
    if n == 0:
        yield 1
    ans = 1
    for i in range(1, n + 1):
        ans *= i
        yield ans
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

// A generator: each frame is one call to next(), which resumes at the yield and returns one value.
export function buildTrace({ n }) {
  const frames = []
  const values = []
  frames.push({ phase: 'start', activeLine: CL('function* factorial'), pythonLine: PL('def factorial'), n, i: 0, ans: null, values: [], message: `The generator will yield the factorials of 1 to ${n}.` })
  if (n === 0) {
    values.push(1)
    frames.push({ phase: 'yield', activeLine: CL('yield 1'), pythonLine: PL('yield 1'), n, i: 0, ans: 1, values: [...values], message: 'n is 0, so the first and only value is 1.' })
  }
  let ans = 1
  for (let i = 1; i <= n; i++) {
    ans *= i
    values.push(ans)
    frames.push({ phase: 'yield', activeLine: CL('yield ans'), pythonLine: PL('yield ans'), n, i, ans, values: [...values], message: `next() resumes; ${i}! = ${ans} is yielded.` })
  }
  frames.push({ phase: 'done', activeLine: CL('yield ans'), pythonLine: PL('yield ans'), n, i: n, ans, values: [...values], result: [...values], message: 'The generator is finished; the next call to next() reports done.' })
  return { input: { n }, result: [...values], frames }
}
