const MIN_LENGTH = 3
const MAX_LENGTH = 30

export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < MIN_LENGTH || s.length > MAX_LENGTH || !/^[a-z]+$/.test(s)) throw new Error(`s must be ${MIN_LENGTH} to ${MAX_LENGTH} lowercase letters.`)
  const counts = Object.values(tally(s))
  if (!counts.some(c => c % 2 === 1) || !counts.some(c => c % 2 === 0)) throw new Error('s needs at least one letter with an odd count and one with an even count.')
  return s
}

export const code = `largest odd count minus smallest even count
  set count to the number of times each letter occurs in s
  set odd to 0 and even to infinity
  for each letter with a positive count
    if its count is odd then
      set odd to the larger of odd and its count
    otherwise
      set even to the smaller of even and its count
  return odd minus even`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

const tally = text => {
  const out = {}
  for (const ch of text) out[ch] = (out[ch] ?? 0) + 1
  return out
}

export function buildTrace(s) {
  const count = tally(s)
  let odd = 0
  let even = Infinity
  const frames = [{ phase: 'start', letter: null, count: 0, odd, even: null, activeLine: L('set count to'), message: 'Count how often each letter occurs in s.' }]
  for (const [letter, c] of Object.entries(count)) {
    if (c % 2 === 1) odd = Math.max(odd, c)
    else even = Math.min(even, c)
    frames.push({ phase: 'letter', letter, count: c, odd, even: even === Infinity ? null : even, activeLine: c % 2 === 1 ? L('set odd to the larger') : L('set even to the smaller'), message: `${letter} occurs ${c} times (${c % 2 === 1 ? 'odd' : 'even'}).` })
  }
  const result = odd - even
  frames.push({ phase: 'done', letter: null, count: 0, odd, even, activeLine: L('return odd minus even'), message: `${odd} minus ${even} is ${result}.` })
  return { input: s, result, frames }
}

export const python = `def max_difference_even_odd(s):
    count = {}
    for ch in s:
        count[ch] = count.get(ch, 0) + 1
    odd = 0
    even = float('inf')
    for c in count.values():
        if c % 2 == 1:
            odd = max(odd, c)
        else:
            even = min(even, c)
    return odd - even
`
