export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Number.isInteger(input.n) || input.n < 1 || input.n > 30) throw new Error('Use an object with n, an integer from 1 to 30.')
  return input
}

const WORKER = { fizzbuzz: 'fizzbuzz worker', fizz: 'fizz worker', buzz: 'buzz worker', number: 'number worker' }

export function buildTrace({ n }) {
  const printed = []
  const frames = [{ phase: 'start', pythonLine: PL('out = []'), activeLine: L('start with an empty output'), state: [], message: `Print 1 through ${n} across four workers.` }]
  for (let i = 1; i <= n; i++) {
    let kind
    let line
    if (i % 15 === 0) { kind = 'fizzbuzz'; line = PL('out.append("fizzbuzz")') }
    else if (i % 3 === 0) { kind = 'fizz'; line = PL('out.append("fizz")') }
    else if (i % 5 === 0) { kind = 'buzz'; line = PL('out.append("buzz")') }
    else { kind = 'number'; line = PL('out.append(str(i))') }
    const word = kind === 'number' ? String(i) : kind
    printed.push(word)
    frames.push({ phase: kind, pythonLine: line, activeLine: L('pick the rule that matches'), state: [...printed], message: `${WORKER[kind]} prints ${word} for ${i}.` })
  }
  frames.push({ phase: 'done', pythonLine: PL('return out'), activeLine: L('return the output'), state: [...printed], message: 'Every number has been printed in order.' })
  return { input: { n }, result: printed, frames }
}

export const code = `fizz buzz with one worker per output kind
  start with an empty output
  for each number from 1 to n in turn
    pick the rule that matches the number
      if divisible by both three and five then the fizzbuzz worker prints
      otherwise if divisible by three then the fizz worker prints
      otherwise if divisible by five then the buzz worker prints
      otherwise the number worker prints the number
  return the output`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def fizz_buzz(n):
    out = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            out.append("fizzbuzz")
        elif i % 3 == 0:
            out.append("fizz")
        elif i % 5 == 0:
            out.append("buzz")
        else:
            out.append(str(i))
    return out
`
const PL = s => python.split('\n').findIndex(l => l.includes(s)) + 1
