export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 30) throw new Error('Use a JSON string of 1 to 30 uppercase letters.')
  if (!/^[A-Z]+$/.test(s)) throw new Error('Use uppercase letters A to Z only.')
  return s
}

export function buildTrace(s) {
  const n = s.length
  const frames = []
  // Base count: every L, then C, then T, with running counts of earlier letters.
  let seenL = 0
  let seenLC = 0
  let base = 0
  for (let i = 0; i < n; i++) {
    const ch = s[i]
    if (ch === 'L') seenL++
    else if (ch === 'C') seenLC += seenL
    else if (ch === 'T') base += seenLC
    frames.push({ phase: 'scan', activeLine: L('count the LCT subsequences'), index: i, base, gain: null, message: `Read ${ch} at ${i}. LCT subsequences so far: ${base}.` })
  }
  let ctPairs = 0
  let seenT = 0
  for (let i = n - 1; i >= 0; i--) {
    if (s[i] === 'T') seenT++
    else if (s[i] === 'C') ctPairs += seenT
  }
  const gainL = ctPairs
  frames.push({ phase: 'gain', activeLine: L('count the CT subsequences'), index: 0, base, gain: gainL, message: `Insert L at the front: gains the ${gainL} CT subsequences.` })
  const gainT = seenLC
  frames.push({ phase: 'gain', activeLine: L('count the LC subsequences'), index: n - 1, base, gain: gainT, message: `Insert T at the end: gains the ${gainT} LC subsequences.` })
  const totalT = [...s].filter(ch => ch === 'T').length
  let lBefore = 0
  let tBefore = 0
  let gainC = 0
  let bestPos = 0
  for (let p = 0; p <= n; p++) {
    const value = lBefore * (totalT - tBefore)
    if (value > gainC) { gainC = value; bestPos = p }
    if (p < n) {
      if (s[p] === 'L') lBefore++
      if (s[p] === 'T') tBefore++
    }
  }
  frames.push({ phase: 'gain', activeLine: L('find the best position'), index: bestPos, base, gain: gainC, message: `Insert C before index ${bestPos}: gains ${gainC} LT pairs around it.` })
  const result = base + Math.max(0, gainL, gainT, gainC)
  frames.push({ phase: 'done', activeLine: L('return base plus'), index: -1, base, gain: result - base, message: `Answer: ${result}.` })
  return { input: s, result, frames }
}

export const code = `max LCT after one insertion (s):
  count the LCT subsequences already in s, as base
  count the CT subsequences in s, the gain from inserting L at the front
  count the LC subsequences in s, the gain from inserting T at the end
  find the best position p for a C, maximizing L before p times T after p
  return base plus the largest of 0, the gains for L, T and C`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_lct_after_insert(s):
    n = len(s)
    ct_pairs = 0
    seen_t = 0
    for ch in reversed(s):
        if ch == 'T':
            seen_t += 1
        elif ch == 'C':
            ct_pairs += seen_t
    base = 0
    seen_l = 0
    lc_pairs = 0
    for ch in s:
        if ch == 'L':
            seen_l += 1
        elif ch == 'C':
            lc_pairs += seen_l
        elif ch == 'T':
            base += lc_pairs
    total_t = s.count('T')
    l_before = 0
    t_before = 0
    gain_c = 0
    for p in range(n + 1):
        gain_c = max(gain_c, l_before * (total_t - t_before))
        if p < n:
            if s[p] == 'L':
                l_before += 1
            if s[p] == 'T':
                t_before += 1
    return base + max(0, ct_pairs, lc_pairs, gain_c)
`
