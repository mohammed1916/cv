// LeetCode 2178: Maximum Split of Positive Even Integers.
// An odd total cannot be split into even parts. Otherwise take 2, 4, 6, ... while the rest still allows the next part;
// the leftover (always at least the last part) is added to the largest part so every part stays even.

const MAX_SUM = 400

export function parseInput(text) {
  const value = Number(String(text).trim())
  if (!Number.isInteger(value) || value < 1 || value > MAX_SUM) throw new Error(`Use an integer from 1 to ${MAX_SUM}. The visualization caps the total there.`)
  return { finalSum: value }
}

export const code = `FUNCTION maximumEvenSplit(finalSum)
    IF finalSum mod 2 is not 0 THEN
        RETURN empty list
    parts ← empty list
    next ← 2
    remaining ← finalSum
    WHILE remaining >= next
        append next to parts
        remaining ← remaining - next
        next ← next + 2
    last ← last element of parts
    parts[last] ← parts[last] + remaining
    RETURN parts`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def maximum_even_split(final_sum):
    if final_sum % 2 != 0:
        return []
    parts = []
    nxt = 2
    remaining = final_sum
    while remaining >= nxt:
        parts.append(nxt)
        remaining -= nxt
        nxt += 2
    parts[-1] += remaining
    return parts
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
  { id: 'check', label: 'Parity', description: 'An odd total has no even split.' },
  { id: 'take', label: 'Take parts', description: 'Take the next even number while the rest can still hold it.' },
  { id: 'absorb', label: 'Absorb rest', description: 'Add what is left to the last part.' },
  { id: 'done', label: 'Result', description: 'The split with the most parts.' },
]

export function buildTrace({ finalSum }) {
  const frames = []
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({ phase, index: -1, activeLine, pythonLine, message, finalSum, ...extra })
  push('check', L('IF finalSum mod 2'), P('if final_sum % 2'), `${finalSum} is ${finalSum % 2 === 0 ? 'even' : 'odd'}.`)
  if (finalSum % 2 !== 0) {
    push('done', L('RETURN empty list'), P('return []'), `An odd total has no split into positive even integers.`, { parts: [] })
    return { input: { finalSum }, result: [], frames }
  }
  const parts = []
  let nxt = 2
  let remaining = finalSum
  while (remaining >= nxt) {
    parts.push(nxt)
    remaining -= nxt
    push('take', L('append next'), P('parts.append(nxt)'), `Take ${nxt}. ${remaining} is left, and the next even part is ${nxt + 2}.`, { parts: parts.slice(), remaining, next: nxt + 2 })
    nxt += 2
  }
  if (parts.length === 0) {
    push('absorb', L('RETURN parts'), P('return parts'), `${finalSum} is smaller than 2, so there are no parts.`, { parts: [] })
    return { input: { finalSum }, result: [], frames }
  }
  parts[parts.length - 1] += remaining
  push('absorb', L('parts[last] ← parts[last] + remaining'), P('parts[-1] += remaining'), `The leftover ${remaining} goes to the last part, which becomes ${parts[parts.length - 1]}. All parts stay even.`, { parts: parts.slice(), remaining: 0 })
  push('done', L('RETURN parts'), P('return parts'), `${parts.length} parts: ${parts.join(', ')}.`, { parts: parts.slice() })
  return { input: { finalSum }, result: parts.slice(), frames }
}
