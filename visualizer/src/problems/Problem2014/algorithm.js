export const phases = [
  { id: 'start', label: 'Usable letters', description: 'A letter can appear in the answer only if it appears at least k times in s.' },
  { id: 'extend', label: 'Extend candidates', description: 'Each valid candidate grows by one usable letter; checking goes through s greedily k times.' },
  { id: 'keep', label: 'Keep valid level', description: 'Keep every candidate of this length that is still repeated k times in s.' },
  { id: 'done', label: 'Result', description: 'The last non-empty level holds the longest, then largest, answer.' },
]

export const code = `function longestSubsequenceRepeatedKTimes(s, k) {
  const letters = []
  for (let c = 97; c <= 122; c++) {
    const ch = String.fromCharCode(c)
    if (s.split(ch).length - 1 >= k) letters.push(ch)
  }
  const repeatedInS = seq => {
    let index = 0
    for (let rep = 0; rep < k; rep++) {
      for (const ch of seq) {
        index = s.indexOf(ch, index)
        if (index === -1) return false
        index++
      }
    }
    return true
  }
  let level = ['']
  let best = ''
  while (true) {
    const next = []
    for (const seq of level) {
      for (const ch of letters) {
        const candidate = seq + ch
        if (repeatedInS(candidate)) next.push(candidate)
      }
    }
    if (next.length === 0) break
    best = next[next.length - 1]
    level = next
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def longest_subsequence_repeated_k_times(s, k):
    letters = [ch for ch in 'abcdefghijklmnopqrstuvwxyz' if s.count(ch) >= k]

    def repeated_in_s(seq):
        index = 0
        for _ in range(k):
            for ch in seq:
                index = s.find(ch, index)
                if index == -1:
                    return False
                index += 1
        return True

    level = ['']
    best = ''
    while True:
        nxt = []
        for seq in level:
            for ch in letters:
                candidate = seq + ch
                if repeated_in_s(candidate):
                    nxt.append(candidate)
        if not nxt:
            break
        best = nxt[-1]
        level = nxt
    return best
`

const C = fragment => code.findIndex(c => c.text.includes(fragment)) + 1
const P = fragment => python.split('\n').findIndex(line => line.includes(fragment)) + 1

function repeatedInS(s, seq, k) {
  let index = 0
  for (let rep = 0; rep < k; rep++) {
    for (const ch of seq) {
      index = s.indexOf(ch, index)
      if (index === -1) return false
      index++
    }
  }
  return true
}

export function parseInput(text) {
  let obj
  try { obj = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"s":"letsleetcode","k":2}.') }
  const { s, k } = obj || {}
  if (typeof s !== 'string' || s.length < 1 || s.length > 24 || !/^[a-z]+$/.test(s)) throw new Error('s must be 1 to 24 lowercase letters here.')
  if (!Number.isInteger(k) || k < 2 || k > 6) throw new Error('k must be a whole number from 2 to 6 here.')
  return { s, k }
}

export function buildTrace({ s, k }) {
  const frames = []
  const letters = []
  for (let c = 97; c <= 122; c++) {
    const ch = String.fromCharCode(c)
    if (s.split(ch).length - 1 >= k) letters.push(ch)
  }
  const add = (phase, c, p, message, level, best) => frames.push({
    phase, activeLine: C(c), pythonLine: P(p), message,
    snapshot: { s, k, letters: letters.slice(), level, best },
  })
  add('start', 'const letters = []', 'letters = [', `Usable letters: ${letters.join(', ') || 'none'}.`, [''], '')
  let level = ['']
  let best = ''
  while (true) {
    const next = []
    for (const seq of level) {
      for (const ch of letters) {
        const candidate = seq + ch
        if (repeatedInS(s, candidate, k)) next.push(candidate)
      }
    }
    if (next.length === 0) {
      add('keep', 'if (next.length === 0)', 'if not nxt', `No candidate of length ${level[0].length + 1} is repeated ${k} times.`, level, best)
      break
    }
    best = next[next.length - 1]
    level = next
    add('extend', 'const next = []', 'nxt = []', `${next.length} candidate(s) of length ${next[0].length} are repeated ${k} times.`, next, best)
  }
  add('done', 'return best', 'return best', best ? `Longest repeated subsequence: "${best}".` : 'No letter is repeated enough, so the answer is empty.', level, best)
  return { input: { s, k }, result: best, frames }
}
