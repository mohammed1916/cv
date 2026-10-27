const MOD = 1000003
const BASE = 27

export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 30) throw new Error('Use a JSON string of 1 to 30 lowercase letters.')
  if (!/^[a-z]+$/.test(s)) throw new Error('Use only lowercase letters a to z.')
  return s
}

export function buildTrace(s) {
  const n = s.length
  const pref = [0]
  const pw = [1]
  for (let i = 0; i < n; i++) {
    pref.push((pref[i] * BASE + s.charCodeAt(i) - 96) % MOD)
    pw.push((pw[i] * BASE) % MOD)
  }
  const hashAt = (i, len) => (pref[i + len] - ((pref[i] * pw[len]) % MOD) + MOD) % MOD
  // Returns the smallest substring of this length that occurs at least twice, or '' if none does.
  const check = len => {
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
  let lo = 1
  let hi = n - 1
  let best = ''
  const frames = [{ phase: 'start', activeLine: L('build prefix'), lo, hi, mid: null, best, message: `Search lengths from ${lo} to ${hi}.` }]
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const candidate = check(mid)
    if (candidate) { best = candidate; lo = mid + 1 } else hi = mid - 1
    frames.push({ phase: 'search', activeLine: L('check length mid'), lo, hi, mid, best, message: candidate ? `Length ${mid} has a repeat (${candidate}). Look longer.` : `Length ${mid} has no repeat. Look shorter.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), lo, hi, mid: null, best, message: best ? `Longest duplicate: ${best}.` : 'No substring repeats.' })
  return { input: s, result: best, frames }
}

export const code = `longest substring that appears at least twice, overlaps allowed
build prefix hashes of s and powers of the base
set lo to 1 and hi to n - 1, and best to empty
while lo is at most hi do
  let mid be the middle of lo and hi
  check length mid: hash every window and compare equal hashes against the text
  if a duplicate is found then set best to the smallest duplicate and lo to mid + 1
  otherwise set hi to mid - 1
return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_duplicate(s):
    MOD = 1000003
    BASE = 27
    n = len(s)
    pref = [0] * (n + 1)
    pw = [1] * (n + 1)
    for i, ch in enumerate(s):
        pref[i + 1] = (pref[i] * BASE + ord(ch) - 96) % MOD
        pw[i + 1] = pw[i] * BASE % MOD

    def check(length):
        buckets = {}
        found = set()
        for i in range(n - length + 1):
            h = (pref[i + length] - pref[i] * pw[length]) % MOD
            window = s[i:i + length]
            starts = buckets.get(h)
            if starts is None:
                buckets[h] = [i]
            elif any(s[j:j + length] == window for j in starts):
                found.add(window)
            else:
                starts.append(i)
        return min(found) if found else ''

    lo, hi, best = 1, n - 1, ''
    while lo <= hi:
        mid = (lo + hi) // 2
        candidate = check(mid)
        if candidate:
            best = candidate
            lo = mid + 1
        else:
            hi = mid - 1
    return best
`
