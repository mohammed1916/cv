export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with num.')
  const { num } = input
  if (!Number.isInteger(num) || num < 1 || num > 1e9) throw new Error('num is an integer from 1 to 1000000000.')
  return { num }
}

export function buildTrace({ num }) {
  const digits = String(num).split('').map(Number)
  const odd = digits.filter(d => d % 2 === 1).sort((a, b) => b - a)
  const even = digits.filter(d => d % 2 === 0).sort((a, b) => b - a)
  const frames = []
  const out = []
  frames.push({ pythonLine: PL('odd = sorted'), phase: 'pools', activeLine: CL('const odd'), at: -1, digits, out: [], odd: [...odd], even: [...even], message: `Split the digits into odd pool ${odd.join(' ') || 'empty'} and even pool ${even.join(' ') || 'empty'}, each largest first.` })
  digits.forEach((d, i) => {
    const kind = d % 2 === 1 ? 'odd' : 'even'
    const pool = kind === 'odd' ? odd : even
    const taken = pool.shift()
    out.push(taken)
    frames.push({ pythonLine: PL('out.append'), phase: 'place', activeLine: CL('out.push'), at: i, digits, out: [...out], odd: [...odd], even: [...even], message: `Position ${i} holds an ${kind} digit, so it takes the largest ${kind} digit left: ${taken}.` })
  })
  const result = Number(out.join(''))
  frames.push({ pythonLine: PL('return int'), phase: 'done', activeLine: CL('return Number'), at: -1, digits, out: [...out], odd: [], even: [], message: `Read the digits back as ${result}.` })
  return { input: { num }, result, frames }
}

export const code = `function largestInteger(num) {
  const digits = String(num).split('').map(Number);
  const odd = digits.filter(d => d % 2 === 1).sort((a, b) => b - a);
  const even = digits.filter(d => d % 2 === 0).sort((a, b) => b - a);
  const out = [];
  for (const d of digits) {
    const pool = d % 2 === 1 ? odd : even;
    out.push(pool.shift());
  }
  return Number(out.join(''));
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def largest_integer(num):
    digits = [int(c) for c in str(num)]
    odd = sorted((d for d in digits if d % 2 == 1), reverse=True)
    even = sorted((d for d in digits if d % 2 == 0), reverse=True)
    out = []
    for d in digits:
        pool = odd if d % 2 == 1 else even
        out.append(pool.pop(0))
    return int("".join(str(d) for d in out))
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }
