export function parseInput(text) {
  const num = JSON.parse(text)
  if (typeof num !== 'string' || num.length < 1 || num.length > 10) throw new Error('Use a JSON string of 1 to 10 digits.')
  if (!/^[0-9]+$/.test(num)) throw new Error('Use digits 0 to 9 only.')
  return num
}

export function buildTrace(num) {
  const frames = [{ phase: 'start', activeLine: L('ok = true'), index: -1, count: null, expected: null, ok: true, message: `Check each position of "${num}".` }]
  let ok = true
  for (let i = 0; i < num.length; i++) {
    let count = 0
    for (const ch of num) if (ch === String(i)) count++
    const expected = Number(num[i])
    const match = count === expected
    frames.push({ phase: match ? 'match' : 'mismatch', activeLine: match ? L('for each index i') : L('ok = false'), index: i, count, expected, ok: match, message: `Digit ${i} appears ${count} times; position ${i} says ${expected}. ${match ? 'Match.' : 'Mismatch.'}` })
    if (!match) {
      ok = false
      break
    }
  }
  frames.push({ phase: 'done', activeLine: L('return ok'), index: -1, count: null, expected: null, ok, message: ok ? 'Every position matches.' : 'At least one position does not match.' })
  return { input: num, result: ok, frames }
}

export const code = `does every digit match its position's count
  ok = true
  for each index i from 0 to the last index
    count = how many times the digit i appears in the number
    if count is not equal to the digit at index i then
      ok = false
      stop checking
  return ok`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def has_equal_digit_counts(num):
    return all(num.count(str(i)) == int(d) for i, d in enumerate(num))
`
