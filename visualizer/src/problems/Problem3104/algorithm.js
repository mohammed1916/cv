const CODE_TEXT = `function longestSelfContained(s) {
  const n = s.length
  const first = new Map()
  const last = new Map()
  for (let i = 0; i < n; i++) {
    if (!first.has(s[i])) first.set(s[i], i)
    last.set(s[i], i)
  }
  let best = -1
  for (let l = 0; l < n; l++) {
    if (first.get(s[l]) !== l) continue
    let r = l
    for (let k = l; k < n; k++) {
      if (first.get(s[k]) < l) break
      r = Math.max(r, last.get(s[k]))
      if (r === k && !(l === 0 && k === n - 1)) best = Math.max(best, k - l + 1)
    }
  }
  return best
}`

const PYTHON_TEXT = `def longest_self_contained(s):
    n = len(s)
    first = {}
    last = {}
    for i, ch in enumerate(s):
        first.setdefault(ch, i)
        last[ch] = i
    best = -1
    for l in range(n):
        if first[s[l]] != l:
            continue
        r = l
        for k in range(l, n):
            if first[s[k]] < l:
                break
            r = max(r, last[s[k]])
            if r == k and not (l == 0 and k == n - 1):
                best = max(best, k - l + 1)
    return best`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = PYTHON_TEXT
const L = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`No pseudocode line: ${s}`); return i + 1 }
const PY = s => { const i = python.split('\n').findIndex(t => t.includes(s)); if (i < 0) throw new Error(`No python line: ${s}`); return i + 1 }

export function parseInput(text) {
  const s = String(text).trim()
  if (!/^[a-z]{1,24}$/.test(s)) throw new Error('Use 1 to 24 lowercase letters.')
  return s
}

export function buildTrace(s) {
  const n = s.length
  const frames = []
  const first = new Map()
  const last = new Map()
  for (let i = 0; i < n; i++) {
    if (!first.has(s[i])) first.set(s[i], i)
    last.set(s[i], i)
  }
  let best = -1
  frames.push({ phase: 'start', activeLine: L('let best = -1'), pythonLine: PY('best = -1'), l: -1, k: -1, r: -1, span: null, best, message: 'Record where each letter first and last appears.' })
  for (let l = 0; l < n; l++) {
    if (first.get(s[l]) !== l) continue
    let r = l
    frames.push({ phase: 'start-l', activeLine: L('for (let l = 0'), pythonLine: PY('for l in range'), l, k: l, r, span: null, best, message: `Try a piece starting at ${l} with letter ${s[l]}.` })
    for (let k = l; k < n; k++) {
      if (first.get(s[k]) < l) {
        frames.push({ phase: 'stop', activeLine: L('if (first.get(s[k]) < l) break'), pythonLine: PY('if first[s[k]] < l'), l, k, r, span: [l, k], best, message: `Letter ${s[k]} also appears before ${l}, so this start cannot work.` })
        break
      }
      r = Math.max(r, last.get(s[k]))
      const closed = r === k
      const whole = l === 0 && k === n - 1
      if (closed && !whole) best = Math.max(best, k - l + 1)
      frames.push({ phase: closed && !whole ? 'record' : 'extend', activeLine: L('if (r === k'), pythonLine: PY('if r == k'), l, k, r, span: [l, k], best, message: closed ? (whole ? `The piece ${l} to ${k} is the whole string, so it does not count.` : `The piece ${l} to ${k} is self-contained, length ${k - l + 1}.`) : `Extend r to ${r} because letter ${s[k]} reaches that far.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: PY('return best'), l: -1, k: -1, r: -1, span: null, best, message: best === -1 ? 'No proper self-contained piece exists, so the answer is -1.' : `The longest proper self-contained piece has length ${best}.` })
  return { input: s, result: best, frames }
}
