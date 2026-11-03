export const phases = [
  { id: 'start', label: 'Start', description: 'Read the string and prepare to alternate sweeps.' },
  { id: 'inspect', label: 'Count', description: 'Count each letter; the sweeps spend these copies.' },
  { id: 'update', label: 'Sweep', description: 'Place one copy of each available letter in the current direction.' },
  { id: 'done', label: 'Complete', description: 'Every copy has been placed.' },
]

export function parseInput(text) {
  const value = JSON.parse(text)
  if (!value || typeof value.s !== 'string' || !/^[a-z]{1,200}$/.test(value.s)) {
    throw new Error('Enter JSON like {"s":"aabbc"} with 1–200 lowercase letters.')
  }
  return { s: value.s }
}

const LINE = { start: 1, count: 2, up: 6, down: 8, done: 9 }
const letter = i => String.fromCharCode(97 + i)

export function buildTrace(input) {
  const { s } = input
  const count = Array(26).fill(0)
  for (const ch of s) count[ch.charCodeAt(0) - 97] += 1
  const out = []
  const remaining = () => Object.fromEntries(count.map((n, i) => [letter(i), n]).filter(([, n]) => n > 0))
  const frames = []
  frames.push({
    phase: 'start', activeLine: LINE.start,
    message: `Read ${s.length} letters. The output alternates an increasing sweep and a decreasing sweep.`,
    snapshot: { out: '', remaining: remaining(), direction: null },
  })
  frames.push({
    phase: 'inspect', activeLine: LINE.count,
    message: `Counts: ${Object.entries(remaining()).map(([c, n]) => `${c}×${n}`).join(', ')}.`,
    snapshot: { out: '', remaining: remaining(), direction: null },
  })
  while (out.length < s.length) {
    for (const direction of ['up', 'down']) {
      const order = Array.from({ length: 26 }, (_, i) => (direction === 'up' ? i : 25 - i))
      for (const i of order) {
        if (count[i] === 0) continue
        out.push(letter(i))
        count[i] -= 1
        frames.push({
          phase: 'update', activeLine: LINE[direction],
          message: `${direction === 'up' ? 'Increasing' : 'Decreasing'} sweep takes ${letter(i)}; ${count[i]} copies of it remain.`,
          snapshot: { out: out.join(''), remaining: remaining(), direction },
        })
      }
    }
  }
  const result = out.join('')
  frames.push({
    phase: 'done', activeLine: LINE.done,
    message: `All ${s.length} letters are placed. Return ${result}.`,
    snapshot: { out: result, remaining: {}, direction: null },
  })
  return { input, result, frames }
}

export const code = `increasing_decreasing(s):
  count = number of copies of each letter 'a'..'z' in s
  out = empty list
  while len(out) < len(s):
    for c from 'a' to 'z':            # increasing sweep
      if count[c] > 0: append c to out; count[c] -= 1
    for c from 'z' to 'a':            # decreasing sweep
      if count[c] > 0: append c to out; count[c] -= 1
  return out`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def increasing_decreasing(s):
    count = [0] * 26
    for ch in s:
        count[ord(ch) - ord('a')] += 1
    out = []
    while len(out) < len(s):
        for i in range(26):                   # increasing sweep
            if count[i] > 0:
                out.append(chr(ord('a') + i))
                count[i] -= 1
        for i in range(25, -1, -1):           # decreasing sweep
            if count[i] > 0:
                out.append(chr(ord('a') + i))
                count[i] -= 1
    return ''.join(out)`
