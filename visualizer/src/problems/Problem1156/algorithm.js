export const phases = [
  { id: 'start', label: 'Start', description: 'Count every letter so each target letter knows its total copies.' },
  { id: 'inspect', label: 'Grow window', description: 'Extend the window to the right and count letters that differ from the target.' },
  { id: 'update', label: 'Repair and record', description: 'Shrink while more than one differing letter remains, then record the capped length.' },
  { id: 'done', label: 'Result', description: 'The best capped window over all target letters is the answer.' },
]

export const code = `function longestRepeated(s) {
  const tot = {}; for (const ch of s) tot[ch] = (tot[ch] ?? 0) + 1; let best = 0
  for (const c of Object.keys(tot)) { let l = 0, bad = 0
    for (let r = 0; r < s.length; r++) {
      if (s[r] !== c) bad++
      while (bad > 1) { if (s[l] !== c) bad--; l++ }
      best = Math.max(best, Math.min(r - l + 1, tot[c]))
    }
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def longest_repeated(s):
    tot = Counter(s)
    best = 0
    for c in tot:
        l, bad = 0, 0
        for r in range(len(s)):
            bad += s[r] != c
            while bad > 1:
                bad -= s[l] != c
                l += 1
            best = max(best, min(r - l + 1, tot[c]))
    return best`

// Line numbers in the JavaScript code and in the Python version of each step.
const L = { count: 2, reset: 3, mark: 5, drop: 6, cap: 7, ret: 10 }
const PL = { count: 2, reset: 5, mark: 7, drop: 9, cap: 11, ret: 12 }

export function parseInput(text) {
  const s = String(text).trim()
  if (!/^[a-z]{1,40}$/.test(s)) throw new Error('Enter 1 to 40 lowercase letters with no spaces.')
  return s
}

export function buildTrace(s) {
  const frames = []
  const tot = {}
  for (const ch of s) tot[ch] = (tot[ch] || 0) + 1
  const letters = Object.keys(tot).sort()
  let best = 0
  let bestWindow = null
  const snap = (extra = {}) => ({ s, tot: { ...tot }, letter: null, l: 0, r: -1, bad: 0, best, bestWindow, ...extra })
  frames.push({ phase: 'start', activeLine: L.count, pythonLine: PL.count, message: `Letter copies: ${letters.map(c => `${c}=${tot[c]}`).join(', ')}.`, snapshot: snap() })

  for (const c of letters) {
    frames.push({ phase: 'start', activeLine: L.reset, pythonLine: PL.reset, message: `Target letter ${c} has ${tot[c]} copies. Start a window with no spare swap used.`, snapshot: snap({ letter: c }) })
    let l = 0, bad = 0
    for (let r = 0; r < s.length; r++) {
      if (s[r] !== c) bad++
      frames.push({
        phase: 'inspect', activeLine: L.mark, pythonLine: PL.mark,
        message: `Extend the window to position ${r} (${s[r]}). The window [${l}..${r}] has ${bad} letter${bad === 1 ? '' : 's'} that differ from ${c}.`,
        snapshot: snap({ letter: c, l, r, bad }),
      })
      while (bad > 1) {
        if (s[l] !== c) bad--
        l++
        frames.push({
          phase: 'update', activeLine: L.drop, pythonLine: PL.drop,
          message: `Too many differing letters, so drop position ${l - 1}. The window is now [${l}..${r}].`,
          snapshot: snap({ letter: c, l, r, bad }),
        })
      }
      const cap = Math.min(r - l + 1, tot[c])
      if (cap > best) { best = cap; bestWindow = { letter: c, l, r, cap } }
      frames.push({
        phase: 'update', activeLine: L.cap, pythonLine: PL.cap,
        message: `Window [${l}..${r}] has length ${r - l + 1}, capped by ${tot[c]} copies of ${c} to ${cap}. Best so far: ${best}.`,
        snapshot: snap({ letter: c, l, r, bad, best, bestWindow }),
      })
    }
  }
  frames.push({ phase: 'done', activeLine: L.ret, pythonLine: PL.ret, message: `The longest obtainable run has length ${best}.`, snapshot: snap({ best, bestWindow }) })
  return { input: s, result: best, frames }
}
