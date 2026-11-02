export function parseInput(text) {
  const digits = JSON.parse(text)
  if (!Array.isArray(digits) || digits.length < 3 || digits.length > 12) throw new Error('Use a JSON array of 3 to 12 digits.')
  if (!digits.every(d => Number.isInteger(d) && d >= 0 && d <= 9)) throw new Error('Each entry is a digit from 0 to 9.')
  return digits
}

export function buildTrace(digits) {
  const frames = []
  const seen = new Set()
  const n = digits.length
  frames.push({ pythonLine: 2, phase: 'start', activeLine: L('start with an empty set'), picked: [], number: null, ok: null, count: 0, message: 'No numbers have been formed yet.' })
  for (let i = 0; i < n; i++) {
    if (digits[i] === 0) {
      frames.push({ pythonLine: 6, phase: 'skip', activeLine: L('if digit i is zero'), picked: [i], number: null, ok: null, count: seen.size, message: `Digit ${i} is 0, so it cannot start a 3-digit number.` })
      continue
    }
    for (let j = 0; j < n; j++) {
      if (j === i) continue
      for (let k = 0; k < n; k++) {
        if (k === i || k === j) continue
        const value = 100 * digits[i] + 10 * digits[j] + digits[k]
        if (digits[k] % 2 !== 0) {
          frames.push({ pythonLine: 13, phase: 'odd', activeLine: L('if digit k is even'), picked: [i, j, k], number: value, ok: false, count: seen.size, message: `${value} ends in an odd digit, so it is skipped.` })
          continue
        }
        const fresh = !seen.has(value)
        seen.add(value)
        frames.push({ pythonLine: 14, phase: fresh ? 'add' : 'repeat', activeLine: L('add the number'), picked: [i, j, k], number: value, ok: fresh, count: seen.size,
          message: fresh ? `${value} is a new even number; ${seen.size} so far.` : `${value} was already in the set.` })
      }
    }
  }
  frames.push({ pythonLine: 15, phase: 'done', activeLine: L('return the size'), picked: [], number: null, ok: null, count: seen.size, message: `${seen.size} distinct numbers can be formed.` })
  return { input: digits, result: seen.size, frames }
}

export const code = `count the distinct 3-digit even numbers that can be formed from the digits
  start with an empty set of numbers
  for each index i as the hundreds digit
    if digit i is zero then skip it
    for each index j different from i as the tens digit
      for each index k different from i and j as the units digit
        if digit k is even then
          add the number 100 * digit i + 10 * digit j + digit k to the set
  return the size of the set`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def unique_even_numbers(digits):
    seen = set()
    n = len(digits)
    for i in range(n):
        if digits[i] == 0:
            continue
        for j in range(n):
            if j == i:
                continue
            for k in range(n):
                if k == i or k == j:
                    continue
                if digits[k] % 2 == 0:
                    seen.add(100 * digits[i] + 10 * digits[j] + digits[k])
    return len(seen)
`
