const MOD = 1000003
const BASE = 27

export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 30) throw new Error('Use a JSON string of 1 to 30 lowercase letters.')
  if (!/^[a-z]+$/.test(s)) throw new Error('Use only lowercase letters a to z.')
  return s
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function longestDuplicateSubstring(s) {', 'def longest_duplicate(s):'],
  ['  const MOD = 1000003', '    MOD = 1000003'],
  ['  const BASE = 27', '    BASE = 27'],
  ['  const n = s.length', '    n = len(s)'],
  ['  const pref = [0]', '    pref = [0] * (n + 1)'],
  ['  const pw = [1]', '    pw = [1] * (n + 1)'],
  ['  for (let i = 0; i < n; i++) {', '    for i, ch in enumerate(s):'],
  ['    pref.push((pref[i] * BASE + s.charCodeAt(i) - 96) % MOD)', '        pref[i + 1] = (pref[i] * BASE + ord(ch) - 96) % MOD'],
  ['    pw.push((pw[i] * BASE) % MOD)', '        pw[i + 1] = pw[i] * BASE % MOD'],
  ['  }', ''],
  ['  const check = len => {', '    def check(length):'],
  ['    const buckets = new Map()', '        buckets = {}'],
  ['    const found = new Set()', '        found = set()'],
  ['    for (let i = 0; i + len <= n; i++) {', '        for i in range(n - length + 1):'],
  ['      const h = (pref[i + len] - ((pref[i] * pw[len]) % MOD) + MOD) % MOD', '            h = (pref[i + length] - pref[i] * pw[length]) % MOD'],
  ['      const window = s.slice(i, i + len)', '            window = s[i:i + length]'],
  ['      const starts = buckets.get(h)', '            starts = buckets.get(h)'],
  ['      if (!starts) buckets.set(h, [i])', '            if starts is None: buckets[h] = [i]'],
  ['      else if (starts.some(j => s.slice(j, j + len) === window)) found.add(window)', '            elif any(s[j:j + length] == window for j in starts): found.add(window)'],
  ['      else starts.push(i)', '            else: starts.append(i)'],
  ['    }', ''],
  ['    return found.size ? [...found].sort()[0] : ""', "        return min(found) if found else ''"],
  ['  }', ''],
  ['  let lo = 1, hi = n - 1, best = ""', "    lo, hi, best = 1, n - 1, ''"],
  ['  while (lo <= hi) {', '    while lo <= hi:'],
  ['    const mid = (lo + hi) >> 1', '        mid = (lo + hi) // 2'],
  ['    const candidate = check(mid)', '        candidate = check(mid)'],
  ['    if (candidate) { best = candidate; lo = mid + 1 }', '        if candidate: best = candidate; lo = mid + 1'],
  ['    else hi = mid - 1', '        else: hi = mid - 1'],
  ['  }', ''],
  ['  return best', '    return best'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

// Returns the smallest substring of this length that occurs at least twice, or '' if none does.
function checkLength(s, pref, pw, len) {
  const n = s.length
  const hashAt = (i, l) => (pref[i + l] - ((pref[i] * pw[l]) % MOD) + MOD) % MOD
  const buckets = new Map()
  const found = new Set()
  for (let i = 0; i + len <= n; i++) {
    const h = hashAt(i, len)
    const window = s.slice(i, i + len)
    const starts = buckets.get(h)
    if (!starts) buckets.set(h, [i])
    else if (starts.some(j => s.slice(j, j + len) === window)) found.add(window)
    else starts.push(i)
  }
  return found.size ? [...found].sort()[0] : ''
}

export function buildTrace(s) {
  const n = s.length
  const pref = [0]
  const pw = [1]
  for (let i = 0; i < n; i++) {
    pref.push((pref[i] * BASE + s.charCodeAt(i) - 96) % MOD)
    pw.push((pw[i] * BASE) % MOD)
  }
  const check = len => checkLength(s, pref, pw, len)
  let lo = 1
  let hi = n - 1
  let best = ''
  const frames = [{ phase: 'start', pythonLine: P('lo, hi, best = 1'), activeLine: L('let lo = 1'), lo, hi, mid: null, best, message: `Search lengths from ${lo} to ${hi}.` }]
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const candidate = check(mid)
    if (candidate) { best = candidate; lo = mid + 1 } else hi = mid - 1
    frames.push({ phase: 'search', pythonLine: P('candidate = check(mid)'), activeLine: L('const candidate'), lo, hi, mid, found: Boolean(candidate), best, message: candidate ? `Length ${mid} has a repeat (${candidate}). Look longer.` : `Length ${mid} has no repeat. Look shorter.` })
  }
  frames.push({ phase: 'done', pythonLine: P('return best'), activeLine: L('return best'), lo, hi, mid: null, found: false, best, message: best ? `Longest duplicate: ${best}.` : 'No substring repeats.' })
  return { input: s, result: best, frames }
}
