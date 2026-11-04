export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use a JSON object with a string s.')
  const { s } = data
  if (typeof s !== 'string' || !/^[a-z]{1,12}$/.test(s)) throw new Error('s must be 1 to 12 lowercase letters.')
  return { s }
}

export function buildTrace(input) {
  const s = input.s
  const first = {}
  const last = {}
  for (let i = 0; i < s.length; i++) {
    if (!(s[i] in first)) first[s[i]] = i
    last[s[i]] = i
  }
  const letters = Object.keys(first).sort((a, b) => first[a] - first[b])
  const cands = []
  const frames = [{ phase: 'start', activeLine: L('const first = {}'), pythonLine: 9, s, picked: [], current: null, message: 'Each letter that must stay together gives one candidate span, grown until it closes.' }]
  for (const c of letters) {
    let l = first[c]
    let r = last[c]
    let ok = true
    for (let k = l; k <= r; k++) {
      const ch = s[k]
      if (first[ch] < l) { ok = false; break }
      r = Math.max(r, last[ch])
    }
    if (ok) {
      cands.push({ l, r })
      frames.push({ phase: 'candidate', activeLine: L('if (ok) cands.push'), pythonLine: 22, s, picked: [], current: [l, r], message: `Letter ${c}: the closed span ${s.slice(l, r + 1)} is a candidate.` })
    }
  }
  cands.sort((a, b) => a.r - b.r || b.l - a.l)
  let lastEnd = -1
  const picked = []
  for (const cand of cands) {
    if (cand.l > lastEnd) {
      picked.push([cand.l, cand.r])
      lastEnd = cand.r
      frames.push({ phase: 'take', activeLine: L('if (l > lastEnd)'), pythonLine: 28, s, picked: picked.map(p => [...p]), current: [cand.l, cand.r], message: `Take ${s.slice(cand.l, cand.r + 1)}; it starts after the last taken span.` })
    } else {
      frames.push({ phase: 'skip', activeLine: L('if (l > lastEnd)'), pythonLine: 27, s, picked: picked.map(p => [...p]), current: [cand.l, cand.r], message: `Skip ${s.slice(cand.l, cand.r + 1)}; it overlaps a taken span.` })
    }
  }
  const result = picked.map(([l, r]) => s.slice(l, r + 1))
  frames.push({ phase: 'done', activeLine: L('return picked'), pythonLine: 30, s, picked: picked.map(p => [...p]), current: null, message: `Maximum count: ${result.length}.` })
  return { input, result, frames }
}

const CODE = [
  'function maxNonOverlapping(s) {',
  '  const first = {}, last = {}',
  '  for (let i = 0; i < s.length; i++) {',
  '    if (!(s[i] in first)) first[s[i]] = i',
  '    last[s[i]] = i',
  '  }',
  '  const cands = []',
  '  for (const c of Object.keys(first)) {',
  '    let l = first[c], r = last[c], ok = true',
  '    for (let k = l; k <= r; k++) {',
  '      if (first[s[k]] < l) { ok = false; break }',
  '      r = Math.max(r, last[s[k]])',
  '    }',
  '    if (ok) cands.push([l, r])',
  '  }',
  '  cands.sort((a, b) => a[1] - b[1] || b[0] - a[0])',
  '  const picked = []',
  '  let lastEnd = -1',
  '  for (const [l, r] of cands) {',
  '    if (l > lastEnd) { picked.push(s.slice(l, r + 1)); lastEnd = r }',
  '  }',
  '  return picked',
  '}',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
const L = s => CODE.findIndex(c => c.includes(s)) + 1

export const python = `def max_non_overlapping(s):
    first = {}
    last = {}
    for i, c in enumerate(s):
        if c not in first:
            first[c] = i
        last[c] = i
    cands = []
    for c in sorted(first, key=lambda ch: first[ch]):
        l = first[c]
        r = last[c]
        ok = True
        k = l
        while k <= r:
            ch = s[k]
            if first[ch] < l:
                ok = False
                break
            r = max(r, last[ch])
            k += 1
        if ok:
            cands.append((l, r))
    cands.sort(key=lambda t: (t[1], -t[0]))
    picked = []
    last_end = -1
    for l, r in cands:
        if l > last_end:
            picked.append(s[l:r + 1])
            last_end = r
    return picked
`
