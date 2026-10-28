export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 20) throw new Error('Use a JSON string of 1 to 20 characters.')
  if (!/^[a-z]+$/.test(s)) throw new Error('Use lowercase letters a to z only.')
  return s
}

export function buildTrace(s) {
  const counts = new Map()
  for (const ch of s) counts.set(ch, (counts.get(ch) ?? 0) + 1)
  const frames = [{ phase: 'count', activeLine: L('count how often'), letter: null, total: 0, message: `Count the characters of "${s}".` }]
  let total = 0
  for (const [letter, count] of counts) {
    if (count % 2 === 1) {
      total += 1
      frames.push({ phase: 'odd', activeLine: L('total = total + 1'), letter, total, message: `${letter} appears ${count} times (odd): operations can reduce it to 1.` })
    } else {
      total += 2
      frames.push({ phase: 'even', activeLine: L('total = total + 2'), letter, total, message: `${letter} appears ${count} times (even): operations can reduce it to 2.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return total'), letter: null, total, message: `Shortest length after operations: ${total}.` })
  return { input: s, result: total, frames }
}

export const code = `shortest length after the operations
  count how often each character appears
  total = 0
  for each character with count c
    if c is odd then
      total = total + 1
    otherwise
      total = total + 2
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import Counter

def minimum_length_after_operations(s):
    total = 0
    for count in Counter(s).values():
        total += 1 if count % 2 else 2
    return total
`
