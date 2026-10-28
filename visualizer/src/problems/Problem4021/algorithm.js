export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj.s !== 'string') throw new Error('Use an object with a string field s.')
  const { s } = obj
  if (s.length < 2 || s.length > 12) throw new Error('Use s with 2 to 12 letters for the visualization.')
  if (!/^[a-z]+$/.test(s)) throw new Error('s must use lowercase letters a to z only.')
  return { s }
}

// Cheapest way to make two letters equal using forward increments on either letter.
const pairCost = (a, b) => {
  const d = (b.charCodeAt(0) - a.charCodeAt(0) + 26) % 26
  return Math.min(d, 26 - d)
}

export function buildTrace(input) {
  const { s } = input
  const n = s.length
  const frames = []
  let best = null
  for (let r = 0; r < n; r++) {
    const t = s.slice(r) + s.slice(0, r)
    let cost = r
    for (let i = 0; i < Math.floor(n / 2); i++) cost += pairCost(t[i], t[n - 1 - i])
    if (best === null || cost < best) best = cost
    frames.push({ phase: 'rotate', activeLine: L('build the rotated string'), r, text: t, cost, best, message: `Rotate ${r} time${r === 1 ? '' : 's'} to get ${t}: total ${cost}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), r: -1, text: s, cost: null, best, message: `Minimum operations: ${best}.` })
  return { input, result: best, frames }
}

export const code = `minimum operations to make a rotated palindrome(s)
  set best to nothing
  for each rotation count r from 0 to n-1 do
    build the rotated string t by moving the first r letters to the end
    set cost to r
    for each i in the first half of t do
      add the cheapest increments that make t[i] and t[n-1-i] equal to cost
    if best is nothing or cost is less than best then
      set best to cost
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_operations_rotated_palindrome(s):
    n = len(s)
    best = None
    for r in range(n):
        t = s[r:] + s[:r]
        cost = r
        for i in range(n // 2):
            d = (ord(t[n - 1 - i]) - ord(t[i])) % 26
            cost += min(d, 26 - d)
        if best is None or cost < best:
            best = cost
    return best
`
