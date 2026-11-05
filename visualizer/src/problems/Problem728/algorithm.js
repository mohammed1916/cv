export function parseInput(text) {
  const data = JSON.parse(text)
  const { left, right } = data ?? {}
  if (!Number.isInteger(left) || !Number.isInteger(right) || left < 1 || right > 10000 || left > right) throw new Error('left and right must be integers with 1 ≤ left ≤ right ≤ 10,000.')
  return { left, right }
}

const JS_LINES = [
  'function selfDividingNumbers(left, right) {',
  '  const result = []',
  '  for (let n = left; n <= right; n++) {',
  '    let rest = n, ok = true',
  '    while (rest > 0 && ok) { // check each digit of n',
  '      const digit = rest % 10',
  '      if (digit === 0 || n % digit !== 0) ok = false // a zero digit or a non-divisor disqualifies n',
  '      rest = Math.floor(rest / 10)',
  '    }',
  '    if (ok) result.push(n)',
  '  }',
  '  return result',
  '}',
]
const PY_LINES = [
  'def self_dividing_numbers(left, right):',
  '    result = []',
  '    for n in range(left, right + 1):',
  '        rest, ok = n, True',
  '        while rest > 0 and ok:',
  '            digit = rest % 10',
  '            if digit == 0 or n % digit != 0:',
  '                ok = False',
  '            rest //= 10',
  '        if ok:',
  '            result.append(n)',
  '    return result',
]
const L = s => JS_LINES.findIndex(t => t.includes(s)) + 1
const P = s => PY_LINES.findIndex(t => t.includes(s)) + 1

export const code = JS_LINES.map((text, index) => ({ line: index + 1, text }))
export const python = PY_LINES.join('\n')

// Each number is tested digit by digit: every digit must be non-zero and must divide the whole number.
export function buildTrace({ left, right }) {
  const result = []
  const frames = [{ phase: 'start', n: left, digits: [], ok: null, result: [], activeLine: L('const result = []'), pythonLine: P('result = []'), message: `Test every number from ${left} to ${right}.` }]
  for (let n = left; n <= right; n++) {
    const digits = []
    let rest = n, ok = true
    while (rest > 0 && ok) {
      const digit = rest % 10
      const divides = digit !== 0 && n % digit === 0
      digits.push({ digit, divides })
      if (!divides) ok = false
      rest = Math.floor(rest / 10)
    }
    if (ok) result.push(n)
    const why = digits.find(d => !d.divides)
    frames.push({ phase: ok ? 'keep' : 'reject', n, digits: [...digits].reverse(), ok, result: [...result], activeLine: L(ok ? 'if (ok) result.push' : 'a zero digit or a non-divisor'), pythonLine: P(ok ? 'result.append(n)' : 'digit == 0'),
      message: ok ? `${n} is self-dividing: every digit divides it.` : why.digit === 0 ? `${n} has a zero digit, so it is rejected.` : `${n} is not divisible by its digit ${why.digit}, so it is rejected.` })
  }
  frames.push({ phase: 'done', n: right, digits: [], ok: null, result: [...result], activeLine: L('return result'), pythonLine: P('return result'), message: `${result.length} self-dividing number${result.length === 1 ? '' : 's'} in the range.` })
  return { input: { left, right }, result, frames }
}
