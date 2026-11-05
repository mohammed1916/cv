const CODE_TEXT = `function makeAntiPalindrome(s) {
  const n = s.length
  if (n % 2 === 1) return "-1"
  const total = new Map()
  for (const ch of s) total.set(ch, (total.get(ch) ?? 0) + 1)
  const letters = [...total.keys()].sort()
  const hasLeft = (prefix, c) => prefix.split(c).length - 1 < total.get(c)
  const allowed = (prefix, c) => !(n - 1 - prefix.length < prefix.length && prefix[n - 1 - prefix.length] === c)
  const memo = new Map()
  const canFinish = prefix => {
    if (prefix.length === n) return true
    if (memo.has(prefix)) return memo.get(prefix)
    const ok = letters.some(c => hasLeft(prefix, c) && allowed(prefix, c) && canFinish(prefix + c))
    memo.set(prefix, ok)
    return ok
  }
  let prefix = ""
  while (prefix.length < n) {
    const c = letters.find(c => hasLeft(prefix, c) && allowed(prefix, c) && canFinish(prefix + c))
    if (c === undefined) return "-1"
    prefix += c
  }
  return prefix
}`
const PYTHON_TEXT = `from collections import Counter
from functools import lru_cache

def make_anti_palindrome(s):
    n = len(s)
    if n % 2 == 1:
        return "-1"
    total = Counter(s)

    def allowed(prefix, c):
        mirror = n - 1 - len(prefix)
        return not (mirror < len(prefix) and prefix[mirror] == c)

    @lru_cache(maxsize=None)
    def can_finish(prefix):
        if len(prefix) == n:
            return True
        left = total - Counter(prefix)
        for c in sorted(left):
            if allowed(prefix, c) and can_finish(prefix + c):
                return True
        return False

    prefix = ""
    while len(prefix) < n:
        left = total - Counter(prefix)
        for c in sorted(left):
            if allowed(prefix, c) and can_finish(prefix + c):
                prefix += c
                break
        else:
            return "-1"
    return prefix`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = PYTHON_TEXT
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`No pseudocode line: ${s}`); return i + 1 }
const PY = s => { const i = python.split('\n').findIndex(t => t.includes(s)); if (i < 0) throw new Error(`No python line: ${s}`); return i + 1 }

export function parseInput(text) {
  const s = String(text).trim()
  if (!/^[a-z]{1,12}$/.test(s)) throw new Error('Use 1 to 12 lowercase letters.')
  return s
}

export function buildTrace(s) {
  const n = s.length
  const frames = []
  const total = new Map()
  for (const ch of s) total.set(ch, (total.get(ch) || 0) + 1)
  const letters = [...total.keys()].sort()
  const remainingOf = prefix => {
    const left = new Map(total)
    for (const ch of prefix) left.set(ch, left.get(ch) - 1)
    return left
  }
  const memo = new Map()
  const allowed = (prefix, c) => {
    const mirror = n - 1 - prefix.length
    return !(mirror < prefix.length && prefix[mirror] === c)
  }
  const canFinish = prefix => {
    if (prefix.length === n) return true
    if (memo.has(prefix)) return memo.get(prefix)
    const left = remainingOf(prefix)
    let ok = false
    for (const c of letters) {
      if (left.get(c) > 0 && allowed(prefix, c) && canFinish(prefix + c)) { ok = true; break }
    }
    memo.set(prefix, ok)
    return ok
  }
  if (n % 2 === 1) {
    frames.push({ phase: 'start', activeLine: L('if (n % 2 === 1)'), pythonLine: PY('if n % 2 == 1'), prefix: '', pos: -1, mirror: -1, tried: null, feasible: null, result: '-1', message: 'The length is odd, so the middle letter sits opposite itself and no anti-palindrome exists.' })
    frames.push({ phase: 'done', activeLine: L('if (n % 2 === 1)'), pythonLine: PY('return "-1"'), prefix: '', pos: -1, mirror: -1, tried: null, feasible: false, result: '-1', message: 'The answer is -1.' })
    return { input: s, result: '-1', frames }
  }
  frames.push({ phase: 'start', activeLine: L('for (const ch of s)'), pythonLine: PY('total = Counter(s)'), prefix: '', pos: 0, mirror: n - 1, tried: null, feasible: canFinish(''), result: null, message: `Counts: ${letters.map(c => `${c}:${total.get(c)}`).join(' ')}. An arrangement exists: ${canFinish('') ? 'yes' : 'no'}.` })
  let prefix = ''
  while (prefix.length < n) {
    const pos = prefix.length
    const mirror = n - 1 - pos
    const left = remainingOf(prefix)
    let chosen = null
    for (const c of letters) {
      if (left.get(c) <= 0) continue
      if (!allowed(prefix, c)) {
        frames.push({ phase: 'skip', activeLine: L('const allowed ='), pythonLine: PY('return not (mirror'), prefix, pos, mirror, tried: c, feasible: false, result: null, message: `${c} would repeat the mirrored letter at ${mirror}.` })
        continue
      }
      const feasible = canFinish(prefix + c)
      frames.push({ phase: feasible ? 'keep' : 'reject', activeLine: L('const ok = letters.some'), pythonLine: PY('if allowed(prefix, c)'), prefix, pos, mirror, tried: c, feasible, result: null, message: feasible ? `Position ${pos} takes ${c}; the rest can still be completed.` : `Position ${pos} cannot take ${c}; the rest would be stuck.` })
      if (feasible) { chosen = c; break }
    }
    if (chosen === null) {
      frames.push({ phase: 'done', activeLine: L('return prefix'), pythonLine: PY('return "-1"'), prefix, pos, mirror, tried: null, feasible: false, result: '-1', message: 'No letter fits here, so the answer is -1.' })
      return { input: s, result: '-1', frames }
    }
    prefix += chosen
    frames.push({ phase: 'place', activeLine: L('prefix += c'), pythonLine: PY('prefix += c'), prefix, pos, mirror, tried: chosen, feasible: true, result: null, message: `Place ${chosen} at position ${pos}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return prefix'), pythonLine: PY('return prefix'), prefix, pos: n, mirror: -1, tried: null, feasible: true, result: prefix, message: `The smallest anti-palindrome is ${prefix}.` })
  return { input: s, result: prefix, frames }
}
