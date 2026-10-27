export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || typeof obj.s !== 'string') throw new Error('Use an object with a string s.')
  const { s } = obj
  if (s.length < 1 || s.length > 10) throw new Error('s has 1 to 10 characters in this visualization.')
  if (!/^[a-z]+$/.test(s)) throw new Error('Use lowercase letters only.')
  return { s }
}

// Two letters can be removed together when they are neighbours in the alphabet, with 'a' and 'z' also neighbours.
const pairs = (a, b) => {
  const d = Math.abs(a.charCodeAt(0) - b.charCodeAt(0))
  return d === 1 || d === 25
}

export function buildTrace(input) {
  const { s } = input
  const n = s.length
  // erasable[i][j] is true when s[i..j-1] can be removed completely.
  const erasable = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(false))
  for (let i = 0; i <= n; i++) erasable[i][i] = true
  const frames = [{ phase: 'erase', activeLine: L('mark every empty stretch'), i: -1, j: -1, best: '', message: 'Empty stretches can be removed trivially.' }]
  for (let len = 2; len <= n; len += 2) {
    for (let i = 0; i + len <= n; i++) {
      const j = i + len
      for (let k = i + 1; k < j; k += 2) {
        if (pairs(s[i], s[k]) && erasable[i + 1][k] && erasable[k + 1][j]) {
          erasable[i][j] = true
          frames.push({ phase: 'erase', activeLine: L('a stretch is erasable'), i, j, best: '', message: `s[${i}..${j - 1}] = ${s.slice(i, j)} can be erased: ${s[i]} pairs with ${s[k]}.` })
          break
        }
      }
    }
  }
  const best = new Array(n + 1).fill('')
  for (let i = n - 1; i >= 0; i--) {
    let cand = s[i] + best[i + 1]
    let from = -1
    for (let j = i + 2; j <= n; j += 2) {
      if (erasable[i][j] && best[j] < cand) { cand = best[j]; from = j }
    }
    best[i] = cand
    frames.push({ phase: 'best', activeLine: L('set best[i] to the smaller'), i, j: from, best: cand, message: from === -1 ? `Keep s[${i}]: best from here is ${cand}.` : `Erase s[${i}..${from - 1}] to reach ${cand}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best[0]'), i: 0, j: -1, best: best[0], message: `Smallest reachable string: ${best[0] === '' ? '(empty)' : best[0]}.` })
  return { input, result: best[0], frames }
}

export const code = `lexicographically smallest string after adjacent removals
  mark every empty stretch as erasable
  for each stretch s[i..j) of even length, shortest first do
    a stretch is erasable if s[i] pairs with some s[k] inside it, the part between them and the part after s[k] are erasable
  set best[n] to the empty string
  for i from n minus 1 down to 0 do
    set best[i] to the smaller of s[i] followed by best[i+1] and best[j] for each erasable stretch from i to j
  return best[0]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_after_removals(s):
    n = len(s)

    def pairs(a, b):
        d = abs(ord(a) - ord(b))
        return d == 1 or d == 25

    erasable = [[False] * (n + 1) for _ in range(n + 1)]
    for i in range(n + 1):
        erasable[i][i] = True
    for length in range(2, n + 1, 2):
        for i in range(0, n - length + 1):
            j = i + length
            for k in range(i + 1, j, 2):
                if pairs(s[i], s[k]) and erasable[i + 1][k] and erasable[k + 1][j]:
                    erasable[i][j] = True
                    break
    best = [''] * (n + 1)
    for i in range(n - 1, -1, -1):
        cand = s[i] + best[i + 1]
        for j in range(i + 2, n + 1, 2):
            if erasable[i][j] and best[j] < cand:
                cand = best[j]
        best[i] = cand
    return best[0]
`
