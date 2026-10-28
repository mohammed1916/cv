export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).join() !== 's') throw new Error('Use a JSON object with one key: {"s": "abbca"}.')
  if (typeof input.s !== 'string' || !/^[a-z]{1,20}$/.test(input.s)) throw new Error('s must be 1 to 20 lowercase letters.')
  return { s: input.s }
}

export function buildTrace(input) {
  const { s } = input
  const last = new Map()
  let current = 0
  let total = 0
  const frames = [{ phase: 'start', activeLine: L('set total and current'), index: -1, letter: '', current, total, message: 'Count substrings by the index where they end. Each index adds the distinct counts of every substring ending there.' }]
  for (let j = 0; j < s.length; j++) {
    const c = s[j]
    const previous = last.has(c) ? last.get(c) : -1
    current += j - previous
    total += current
    last.set(c, j)
    frames.push({ phase: 'scan', activeLine: L('add j minus'), index: j, letter: c, current, total, message: `Letter ${c} at index ${j}: the substrings ending here add up to ${current} distinct letters. Running total ${total}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), index: -1, letter: '', current, total, message: `Total appeal is ${total}.` })
  return { input: { s }, result: total, frames }
}

export const code = `Total appeal of a string
set total and current to zero
set the last position of every letter to nothing
for each index j from left to right
  let c be the letter at index j
  add j minus the last position of c to current, using j plus one when c has no last position
  add current to total
  set the last position of c to j
return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def total_appeal(s):
    last = {}
    current = 0
    total = 0
    for j, c in enumerate(s):
        current += j - last.get(c, -1)
        total += current
        last[c] = j
    return total
`
