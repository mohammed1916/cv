export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).sort().join() !== 'a,b,s') throw new Error('Use a JSON object with exactly the keys s, a and b.')
  const { s, a, b } = input
  if (typeof s !== 'string' || s.length < 2 || s.length > 8 || s.length % 2 !== 0) throw new Error('s must be an even-length string of 2 to 8 digits.')
  if (!/^[0-9]+$/.test(s)) throw new Error('s may contain only the digits 0 to 9.')
  if (!Number.isInteger(a) || a < 1 || a > 9) throw new Error('a must be an integer from 1 to 9.')
  if (!Number.isInteger(b) || b < 1 || b > s.length - 1) throw new Error('b must be an integer from 1 to the length of s minus 1.')
  return { s, a, b }
}

const addToOdd = (t, a) => [...t].map((ch, i) => (i % 2 === 1 ? String((Number(ch) + a) % 10) : ch)).join('')
const rotateRight = (t, b) => t.slice(t.length - b) + t.slice(0, t.length - b)

export function buildTrace({ s, a, b }) {
  let best = s
  const seen = new Set([s])
  const queue = [s]
  const frames = [{ phase: 'start', activeLine: L('set best to s'), current: s, best, queued: 1, message: 'Start with s as the best string so far.' }]
  for (let head = 0; head < queue.length; head++) {
    const cur = queue[head]
    if (cur < best) best = cur
    frames.push({ phase: 'visit', activeLine: L('take the first string'), current: cur, best, queued: queue.length, message: `Visit ${cur}. Best so far: ${best}.` })
    const added = addToOdd(cur, a)
    const rotated = rotateRight(cur, b)
    for (const next of [added, rotated]) {
      if (!seen.has(next)) {
        seen.add(next)
        queue.push(next)
      }
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), current: '', best, queued: 0, message: `Smallest reachable string: ${best}.` })
  return { input: { s, a, b }, result: best, frames }
}

export const code = `smallest reachable string:
  set best to s
  put s in a queue and mark s as seen
  while the queue is not empty
    take the first string cur from the queue
    if cur is smaller than best then set best to cur
    make add-string by adding a to every digit at an odd position, wrapping past 9
    make rotate-string by moving the last b digits to the front
    for each new string among add-string and rotate-string
      if it has not been seen then
        mark it as seen and put it in the queue
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def find_lex_smallest_string(s, a, b):
    n = len(s)
    best = s
    seen = {s}
    queue = [s]
    head = 0
    while head < len(queue):
        cur = queue[head]
        head += 1
        if cur < best:
            best = cur
        digits = list(cur)
        for i in range(1, n, 2):
            digits[i] = str((int(digits[i]) + a) % 10)
        added = ''.join(digits)
        rotated = cur[n - b:] + cur[:n - b]
        for nxt in (added, rotated):
            if nxt not in seen:
                seen.add(nxt)
                queue.append(nxt)
    return best
`
