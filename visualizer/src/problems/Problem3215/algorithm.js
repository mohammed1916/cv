// LeetCode 3215: Count Triplets with Even XOR Set Bits II.
// The parity of a XOR b XOR c is the XOR of their parities, because popcount(x XOR y) has the parity of popcount(x) + popcount(y).
// So each array only needs a count of even-parity and odd-parity values, and the triplets combine in O(1) per array.

const CODE_TEXT = `function countEvenTriples(a, b, c) {
  const parity = value => {
    let ones = 0
    for (let v = value; v > 0; v &= v - 1) ones++
    return ones % 2
  }
  const counts = values => {
    let even = 0
    let odd = 0
    for (const v of values) {
      if (parity(v)) odd++
      else even++
    }
    return [even, odd]
  }
  const [evenA, oddA] = counts(a)
  const [evenB, oddB] = counts(b)
  const [evenC, oddC] = counts(c)
  const evenPairs = evenA * evenB + oddA * oddB
  const oddPairs = evenA * oddB + oddA * evenB
  return evenPairs * evenC + oddPairs * oddC
}`.split('\n')
export const code = CODE_TEXT.map((text, index) => ({ line: index + 1, text }))

export const python = `def count_even_triples(a, b, c):
    def parity_counts(values):
        even = sum(1 for v in values if bin(v).count("1") % 2 == 0)
        return even, len(values) - even

    even_a, odd_a = parity_counts(a)
    even_b, odd_b = parity_counts(b)
    even_c, odd_c = parity_counts(c)
    even_pairs = even_a * even_b + odd_a * odd_b
    odd_pairs = even_a * odd_b + odd_a * even_b
    return even_pairs * even_c + odd_pairs * odd_c


if __name__ == "__main__":
    import json, sys
    data = json.loads(sys.stdin.read())
    print(count_even_triples(data["a"], data["b"], data["c"]))
`

const PY_LINES = python.split('\n')
const L = s => { const n = code.findIndex(c => c.text.includes(s)) + 1; if (!n) throw new Error(`Missing pseudocode line: ${s}`); return n }
const P = s => { const n = PY_LINES.findIndex(l => l.includes(s)) + 1; if (!n) throw new Error(`Missing Python line: ${s}`); return n }

export const phases = [
  { id: 'read', label: 'Arrays', description: 'Name the three arrays.' },
  { id: 'tally', label: 'Tally', description: 'Count even and odd parity values in one array.' },
  { id: 'pairs', label: 'Pairs', description: 'Combine two arrays into even-pair and odd-pair counts.' },
  { id: 'combine', label: 'Triples', description: 'Pair the third array with the pair counts.' },
  { id: 'done', label: 'Result', description: 'Report the number of counted triplets.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with arrays a, b and c.')
  const out = {}
  for (const key of ['a', 'b', 'c']) {
    const arr = input[key]
    if (!Array.isArray(arr) || arr.length < 1 || arr.length > 40) throw new Error(`${key} has 1 to 40 values.`)
    if (!arr.every(v => Number.isInteger(v) && v >= 0 && v <= 1023)) throw new Error(`${key} holds integers from 0 to 1023.`)
    out[key] = arr.slice()
  }
  return out
}

const isEvenBits = v => { let n = 0; for (let t = v; t > 0; t >>= 1) n += t & 1; return n % 2 === 0 }

export function buildTrace({ a, b, c }) {
  const frames = []
  const base = { a, b, c }
  const tallies = {}
  const tally = (name, arr, phase, lineText, pyText) => {
    const even = arr.filter(isEvenBits).length
    tallies[name] = { even, odd: arr.length - even }
    frames.push({ ...base, tallies: { ...tallies }, pairs: null, result: null, phase, activeLine: L(lineText), pythonLine: P(pyText), done: name, message: `${name}: ${even} even-parity and ${arr.length - even} odd-parity value${arr.length - even === 1 ? '' : 's'}.` })
  }
  frames.push({ ...base, tallies: {}, pairs: null, result: null, phase: 'read', activeLine: L('function countEvenTriples'), pythonLine: P('def count_even'), done: null, message: `Arrays of ${a.length}, ${b.length} and ${c.length} values.` })
  tally('a', a, 'tally', 'const [evenA, oddA]', 'even_a, odd_a = parity')
  tally('b', b, 'tally', 'const [evenB, oddB]', 'even_b, odd_b = parity')
  tally('c', c, 'tally', 'const [evenC, oddC]', 'even_c, odd_c = parity')
  const ea = tallies.a.even, oa = tallies.a.odd, eb = tallies.b.even, ob = tallies.b.odd, ec = tallies.c.even, oc = tallies.c.odd
  const evenPairs = ea * eb + oa * ob
  const oddPairs = ea * ob + oa * eb
  frames.push({ ...base, tallies: { ...tallies }, pairs: { even: evenPairs, odd: oddPairs }, result: null, phase: 'pairs', activeLine: L('const evenPairs = evenA'), pythonLine: P('even_pairs = even_a'), done: 'pairs', message: `Pairs from a and b: ${evenPairs} with even parity sum, ${oddPairs} with odd.` })
  const total = evenPairs * ec + oddPairs * oc
  frames.push({ ...base, tallies: { ...tallies }, pairs: { even: evenPairs, odd: oddPairs }, result: total, phase: 'combine', activeLine: L('return evenPairs * evenC'), pythonLine: P('return even_pairs'), done: 'c', message: `Add c: ${evenPairs} * ${ec} + ${oddPairs} * ${oc} = ${total} triplets.` })
  frames.push({ ...base, tallies: { ...tallies }, pairs: { even: evenPairs, odd: oddPairs }, result: total, phase: 'done', activeLine: L('return evenPairs * evenC'), pythonLine: P('return even_pairs'), done: 'done', message: `${total} triplet${total === 1 ? '' : 's'} have an even XOR set-bit count.` })
  return { input: { a, b, c }, result: total, frames }
}
