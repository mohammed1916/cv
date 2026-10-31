const FORMAT = /^\d+(\.\d*(\(\d+\))?)?$/

export function parseInput(text) {
  const spec = JSON.parse(text)
  if (typeof spec.s !== 'string' || typeof spec.t !== 'string' || !FORMAT.test(spec.s) || !FORMAT.test(spec.t)) {
    throw new Error('Each number is digits with an optional ".", then optional digits and a repeating part in parentheses, e.g. "0.(52)".')
  }
  return spec
}

// Exact fraction of a decimal written as I.N(R): x = I + (NR - N) / (10^a * (10^b - 1)),
// where a = length of N and b = length of R; without a repeat, x = I + N / 10^a.
export function toFraction(s) {
  const [intPart, rest = ''] = s.split('.')
  const open = rest.indexOf('(')
  const nonRepeat = open === -1 ? rest : rest.slice(0, open)
  const repeat = open === -1 ? '' : rest.slice(open + 1, -1)
  const whole = BigInt(intPart)
  const N = BigInt(nonRepeat || '0')
  if (repeat === '') {
    const den = 10n ** BigInt(nonRepeat.length)
    return { num: whole * den + N, den }
  }
  const NR = BigInt(nonRepeat + repeat)
  const den = 10n ** BigInt(nonRepeat.length) * (10n ** BigInt(repeat.length) - 1n)
  return { num: whole * den + (NR - N), den }
}

export function buildTrace(spec) {
  const frames = []
  const fs = [spec.s, spec.t].map(s => {
    const f = toFraction(s)
    frames.push({ phase: 'convert', activeLine: L('return the fraction'), pythonLine: s.includes('(') ? 9 : 8, text: s, num: f.num.toString(), den: f.den.toString(), equal: null, message: `${s} = ${f.num} / ${f.den}.` })
    return f
  })
  const equal = fs[0].num * fs[1].den === fs[1].num * fs[0].den
  frames.push({ phase: 'compare', activeLine: L('return whether a.num'), pythonLine: 14, text: null, num: null, den: null, equal, message: `Cross-multiply: ${fs[0].num} × ${fs[1].den} ${equal ? '=' : '≠'} ${fs[1].num} × ${fs[0].den}.` })
  return { input: spec, result: equal, frames }
}

export const code = `isRationalEqual(s, t) returns whether s and t are the same rational number
  set a to toFraction(s), and set b to toFraction(t)
  return whether a.num times b.den equals b.num times a.den
toFraction(s) turns a decimal into a fraction with a numerator and denominator
  split s into the whole part, the non-repeating digits N, and the repeating digits R
  if R is empty, then set num to whole times 10^len(N) plus N, and den to 10^len(N)
  otherwise, set num to whole times den plus (N and R as one number) minus N, and den to 10^len(N) times (10^len(R) minus 1)
  return the fraction num over den`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from fractions import Fraction

def to_fraction(s):
    whole, _, rest = s.partition('.')
    non_repeat, _, repeat = rest.partition('(')
    repeat = repeat.rstrip(')')
    if not repeat:
        return Fraction(int(whole) * 10 ** len(non_repeat) + int(non_repeat or 0), 10 ** len(non_repeat))
    return Fraction(int(whole + non_repeat + repeat) - int(whole + non_repeat), 10 ** len(non_repeat) * (10 ** len(repeat) - 1)) + int(whole)

def is_rational_equal(s, t):
    a = to_fraction(s)
    b = to_fraction(t)
    return a.numerator * b.denominator == b.numerator * a.denominator`
