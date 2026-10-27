const MOD = 1000003
const BASE = 131

export function parseInput(text) {
  const paths = JSON.parse(text)
  if (!Array.isArray(paths) || paths.length < 1 || paths.length > 4) throw new Error('Use 1 to 4 paths.')
  for (const p of paths) {
    if (!Array.isArray(p) || p.length < 1 || p.length > 8) throw new Error('Each path has 1 to 8 city ids.')
    if (p.some(v => !Number.isInteger(v) || v < 0 || v > 4)) throw new Error('City ids are integers from 0 to 4.')
  }
  return paths
}

const sameRun = (a, i, b, j, len) => {
  for (let k = 0; k < len; k++) if (a[i + k] !== b[j + k]) return false
  return true
}

export function buildTrace(paths) {
  const minLen = Math.min(...paths.map(p => p.length))
  const prefs = paths.map(p => {
    const pref = [0]
    for (let i = 0; i < p.length; i++) pref.push((pref[i] * BASE + p[i] + 1) % MOD)
    return pref
  })
  const pw = [1]
  for (let i = 0; i < minLen; i++) pw.push((pw[i] * BASE) % MOD)
  const hashAt = (p, i, len) => (prefs[p][i + len] - ((prefs[p][i] * pw[len]) % MOD) + MOD) % MOD
  // Keeps the starts in path 0 of windows that also appear in every other path.
  const check = len => {
    let cand = new Map()
    for (let i = 0; i + len <= paths[0].length; i++) {
      const h = hashAt(0, i, len)
      if (!cand.has(h)) cand.set(h, [])
      cand.get(h).push(i)
    }
    for (let p = 1; p < paths.length && cand.size; p++) {
      const next = new Map()
      for (let i = 0; i + len <= paths[p].length; i++) {
        const h = hashAt(p, i, len)
        const starts = cand.get(h)
        if (!starts) continue
        const match = starts.find(s0 => sameRun(paths[0], s0, paths[p], i, len))
        if (match === undefined) continue
        if (!next.has(h)) next.set(h, [])
        if (!next.get(h).includes(match)) next.get(h).push(match)
      }
      cand = next
    }
    return cand.size > 0
  }
  let lo = 1
  let hi = minLen
  let best = 0
  const frames = [{ phase: 'start', activeLine: L('longest sequence'), lo, hi, mid: null, best, message: `Search lengths from ${lo} to ${hi}.` }]
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const ok = check(mid)
    if (ok) { best = mid; lo = mid + 1 } else hi = mid - 1
    frames.push({ phase: 'search', activeLine: L('check length mid'), lo, hi, mid, best, message: ok ? `A block of length ${mid} is shared by every path. Look longer.` : `No block of length ${mid} is shared. Look shorter.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), lo, hi, mid: null, best, message: `Longest common subpath: ${best}.` })
  return { input: paths, result: best, frames }
}

export const code = `longest sequence of cities that appears as a contiguous block in every path
let lo be 1 and hi be the shortest path length, and best be 0
while lo is at most hi do
  let mid be the middle of lo and hi
  check length mid: keep the windows of the first path that appear in every other path
  if any window survives then set best to mid and lo to mid + 1
  otherwise set hi to mid - 1
return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_common_subpath(paths):
    MOD = 1000003
    BASE = 131
    shortest = min(len(p) for p in paths)
    prefs = []
    for p in paths:
        pref = [0] * (len(p) + 1)
        for i, v in enumerate(p):
            pref[i + 1] = (pref[i] * BASE + v + 1) % MOD
        prefs.append(pref)
    pw = [1] * (shortest + 1)
    for i in range(shortest):
        pw[i + 1] = pw[i] * BASE % MOD

    def hash_at(p, i, length):
        return (prefs[p][i + length] - prefs[p][i] * pw[length]) % MOD

    def check(length):
        cand = {}
        for i in range(len(paths[0]) - length + 1):
            cand.setdefault(hash_at(0, i, length), []).append(i)
        for p in range(1, len(paths)):
            nxt = {}
            for i in range(len(paths[p]) - length + 1):
                h = hash_at(p, i, length)
                starts = cand.get(h)
                if not starts:
                    continue
                window = paths[p][i:i + length]
                match = next((s0 for s0 in starts if paths[0][s0:s0 + length] == window), None)
                if match is not None and match not in nxt.setdefault(h, []):
                    nxt[h].append(match)
            cand = nxt
            if not cand:
                return False
        return bool(cand)

    lo, hi, best = 1, shortest, 0
    while lo <= hi:
        mid = (lo + hi) // 2
        if check(mid):
            best = mid
            lo = mid + 1
        else:
            hi = mid - 1
    return best
`
