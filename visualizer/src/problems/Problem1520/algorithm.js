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
  const frames = [{ phase: 'start', activeLine: L('for each letter'), s, picked: [], current: null, message: 'Each letter that must stay together gives one candidate span, grown until it closes.' }]
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
      frames.push({ phase: 'candidate', activeLine: L('keep the span'), s, picked: [], current: [l, r], message: `Letter ${c}: the closed span ${s.slice(l, r + 1)} is a candidate.` })
    }
  }
  cands.sort((a, b) => a.r - b.r || b.l - a.l)
  let lastEnd = -1
  const picked = []
  for (const cand of cands) {
    if (cand.l > lastEnd) {
      picked.push([cand.l, cand.r])
      lastEnd = cand.r
      frames.push({ phase: 'take', activeLine: L('take it'), s, picked: picked.map(p => [...p]), current: [cand.l, cand.r], message: `Take ${s.slice(cand.l, cand.r + 1)}; it starts after the last taken span.` })
    } else {
      frames.push({ phase: 'skip', activeLine: L('skip it'), s, picked: picked.map(p => [...p]), current: [cand.l, cand.r], message: `Skip ${s.slice(cand.l, cand.r + 1)}; it overlaps a taken span.` })
    }
  }
  const result = picked.map(([l, r]) => s.slice(l, r + 1))
  frames.push({ phase: 'done', activeLine: L('return the taken substrings'), s, picked: picked.map(p => [...p]), current: null, message: `Maximum count: ${result.length}.` })
  return { input, result, frames }
}

export const code = `maximum number of non-overlapping valid substrings:
  set first and last to the first and last index of each letter
  for each letter in order of first appearance
    start a span from its first index to its last index
    grow the span while a letter inside also appears outside it
    if the span is still closed then keep the span as a candidate
  sort the candidates by right end, then by shorter span first
  set last end to minus one
  for each candidate in that order
    if its left end is after last end then take it and set last end to its right end
    otherwise skip it
  return the taken substrings`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

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
