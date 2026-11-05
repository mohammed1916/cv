// LeetCode 2182: Construct String With Repeat Limit.
// Build greedily from the largest letter. Write it up to limit times; if more copies remain, write one copy of the
// next smaller available letter as a separator, then go back to the largest letter. Stop when no separator exists.

const MAX_LEN = 24
const MAX_LIMIT = 6

export function parseInput(text) {
  let spec
  try { spec = JSON.parse(text) } catch { throw new Error('Use JSON like {"s":"cczazcc","limit":3}.') }
  if (!spec || typeof spec.s !== 'string' || !Number.isInteger(spec.limit)) throw new Error('Give a string s and an integer limit.')
  if (!/^[a-z]+$/.test(spec.s) || spec.s.length < 1 || spec.s.length > MAX_LEN) throw new Error(`Use 1 to ${MAX_LEN} lowercase letters.`)
  if (spec.limit < 1 || spec.limit > MAX_LIMIT) throw new Error(`limit is an integer from 1 to ${MAX_LIMIT}.`)
  return { s: spec.s, limit: spec.limit }
}

export const code = `FUNCTION repeatLimitedString(s, limit)
    count ← frequency of each letter in s
    result ← empty string
    hi ← 25
    WHILE hi >= 0
        IF count[hi] = 0 THEN
            hi ← hi - 1
            CONTINUE
        take ← min(count[hi], limit)
        append letter hi to result take times
        count[hi] ← count[hi] - take
        IF count[hi] > 0 THEN
            lo ← largest letter below hi with count above 0
            IF no such letter THEN BREAK
            append letter lo once to result
            count[lo] ← count[lo] - 1
    RETURN result`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def repeat_limited_string(s, limit):
    count = [0] * 26
    for ch in s:
        count[ord(ch) - ord("a")] += 1
    result = []
    hi = 25
    while hi >= 0:
        if count[hi] == 0:
            hi -= 1
            continue
        take = min(count[hi], limit)
        result.append(chr(ord("a") + hi) * take)
        count[hi] -= take
        if count[hi] > 0:
            lo = hi - 1
            while lo >= 0 and count[lo] == 0:
                lo -= 1
            if lo < 0:
                break
            result.append(chr(ord("a") + lo))
            count[lo] -= 1
    return "".join(result)
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Count', description: 'Count how many of each letter is available.' },
  { id: 'take', label: 'Largest run', description: 'Write the largest letter, at most limit times in a row.' },
  { id: 'separate', label: 'Separator', description: 'When more copies remain, write one smaller letter first.' },
  { id: 'done', label: 'Result', description: 'The string built so far.' },
]

export function buildTrace({ s, limit }) {
  const count = Array(26).fill(0)
  for (const ch of s) count[ch.charCodeAt(0) - 97] += 1
  const letter = i => String.fromCharCode(97 + i)
  const result = []
  let hi = 25
  const frames = []
  const push = (phase, hiIdx, loIdx, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, hi: hiIdx, lo: loIdx, index: hiIdx, activeLine, pythonLine, message, s, limit, result: result.join(''), count: count.slice(), ...extra,
  })
  push('start', -1, -1, L('count ← frequency'), P('count = [0] * 26'), `${s.length} letters counted. The limit is ${limit} in a row.`)
  while (hi >= 0) {
    if (count[hi] === 0) { hi -= 1; continue }
    const take = Math.min(count[hi], limit)
    for (let k = 0; k < take; k++) result.push(letter(hi))
    count[hi] -= take
    push('take', hi, -1, L('take ← min'), P('take = min'),
      `Write ${letter(hi)} ${take} time(s). ${count[hi] > 0 ? `${count[hi]} copies of ${letter(hi)} are left, so a separator is needed.` : `All ${letter(hi)} are used.`}`, { take })
    if (count[hi] > 0) {
      let lo = hi - 1
      while (lo >= 0 && count[lo] === 0) lo -= 1
      if (lo < 0) {
        push('done', hi, -1, L('IF no such letter'), P('if lo < 0'), `No smaller letter is available to separate the ${letter(hi)} run, so the string stops here.`)
        return { input: { s, limit }, result: result.join(''), frames }
      }
      result.push(letter(lo))
      count[lo] -= 1
      push('separate', hi, lo, L('append letter lo'), P('result.append(chr'), `Write one ${letter(lo)} as a separator, then return to ${letter(hi)}.`)
    }
  }
  const out = result.join('')
  push('done', -1, -1, L('RETURN result'), P('return "".join'), `The string is ${out}.`)
  return { input: { s, limit }, result: out, frames }
}
