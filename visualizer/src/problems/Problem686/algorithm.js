export function parseInput(text) {
  const data = JSON.parse(text)
  const { a, b } = data ?? {}
  const ok = s => typeof s === 'string' && /^[a-z]{1,10000}$/.test(s)
  if (!ok(a) || !ok(b)) throw new Error('a and b must be JSON strings of lowercase letters (1–10,000 each).')
  return { a, b }
}

// Repeat a until its length reaches b's, then one more copy covers wrap-around matches.
export function buildTrace({ a, b }) {
  const frames = [{ phase: 'start', copies: 0, text: '', found: false, activeLine: 2, message: `Repeat "${a}" until "${b}" fits.` }]
  let text = ''
  let copies = 0
  let found
  while (true) {
    text += a
    copies++
    found = text.includes(b)
    frames.push({ phase: found ? 'found' : 'repeat', copies, text, found, activeLine: found ? 6 : 4, message: found ? `"${b}" appears after ${copies} cop${copies === 1 ? 'y' : 'ies'}.` : `${copies} cop${copies === 1 ? 'y' : 'ies'}: "${b}" not yet a substring.` })
    if (found) break
    if (copies > Math.ceil(b.length / a.length) + 1) {
      frames.push({ phase: 'stop', copies, text, found: false, activeLine: 8, message: 'One extra copy was tried; no more repeats can help.' })
      break
    }
  }
  const result = found ? copies : -1
  frames.push({ phase: 'done', copies, text, found, result, activeLine: 10, message: result < 0 ? 'Impossible.' : `Minimum repetitions: ${result}.` })
  return { input: { a, b }, result, frames }
}

export const code = `def repeatedStringMatch(a, b):
    times = -(-len(b) // len(a))
    for k in (times, times + 1):
        if b in a * k: return k
    return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))
