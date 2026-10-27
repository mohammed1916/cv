export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Number.isInteger(data.n)) throw new Error('Use an object with an integer n, for example {"n":33}.')
  if (data.n < 1 || data.n > 5000) throw new Error('n must be an integer from 1 to 5000 in this visualization.')
  return { n: data.n }
}

function digitCounts(text) {
  const counts = {}
  for (const digit of text) counts[digit] = (counts[digit] || 0) + 1
  return counts
}

export function buildTrace({ n }) {
  const frames = []
  const checked = []
  let candidate = n + 1
  frames.push({ phase: 'start', activeLine: L('set candidate to n plus one'), candidate, checked: [], message: `Start checking the numbers after ${n}.` })
  for (;;) {
    const text = String(candidate)
    if (text === [...text].reverse().join('')) {
      const counts = digitCounts(text)
      const failing = Object.entries(counts).find(([digit, count]) => Number(digit) !== count)
      if (!failing) {
        checked.push(candidate)
        frames.push({ phase: 'found', activeLine: L('return candidate'), candidate, checked: [...checked], message: `${candidate} reads the same both ways, and every digit d appears exactly d times.` })
        break
      }
      checked.push(candidate)
      frames.push({ phase: 'reject', activeLine: L('its count must equal d'), candidate, checked: [...checked], message: `${candidate} is a palindrome, but digit ${failing[0]} appears ${failing[1]} times, not ${failing[0]}.` })
    }
    candidate += 1
  }
  return { input: { n }, result: candidate, frames }
}

export const code = `next special palindrome number (n)
  set candidate to n plus one
  while candidate is not a special palindrome
    add one to candidate
  return candidate

special palindrome check (x)
  if the digits of x do not read the same backwards then return false
  count how many times each digit appears in x
  for each digit d that appears, its count must equal d
  return true when every digit passes`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1
export const python = `def next_special_palindrome(n):
    candidate = n + 1
    while True:
        text = str(candidate)
        if text == text[::-1]:
            counts = {}
            for digit in text:
                counts[digit] = counts.get(digit, 0) + 1
            if all(int(d) == c for d, c in counts.items()):
                return candidate
        candidate += 1
`
