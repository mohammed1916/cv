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
    frames.push({ phase: 'convert', activeLine: L('return whole'), text: s, num: f.num.toString(), den: f.den.toString(), equal: null, message: `${s} = ${f.num} / ${f.den}.` })
    return f
  })
  const equal = fs[0].num * fs[1].den === fs[1].num * fs[0].den
  frames.push({ phase: 'compare', activeLine: L('return a.num'), text: null, num: null, den: null, equal, message: `Cross-multiply: ${fs[0].num} × ${fs[1].den} ${equal ? '=' : '≠'} ${fs[1].num} × ${fs[0].den}.` })
  return { input: spec, result: equal, frames }
}

export const code = `from fractions import Fraction

def toFraction(s):
    whole, _, rest = s.partition('.')
    nonRepeat, _, repeat = rest.partition('(')
    repeat = repeat.rstrip(')')
    if not repeat:
        return Fraction(int(whole) * 10 ** len(nonRepeat) + int(nonRepeat or 0), 10 ** len(nonRepeat))
    return Fraction(int(whole + nonRepeat + repeat) - int(whole + nonRepeat), 10 ** len(nonRepeat) * (10 ** len(repeat) - 1)) + int(whole)

def isRationalEqual(s, t):
    a = toFraction(s)
    b = toFraction(t)
    return a.num * b.den == b.num * a.den`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
