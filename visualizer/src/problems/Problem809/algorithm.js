export function runsOf(w) {
  const out = []
  for (const ch of w) {
    if (out.length && out[out.length - 1][0] === ch) out[out.length - 1][1] += 1
    else out.push([ch, 1])
  }
  return out
}
export function parseInput(text) {
  const d = JSON.parse(text)
  const bad = () => new Error('Enter JSON {"s": "heeello", "words": ["hello", ...]}: lowercase strings of 1-30 letters, at most 8 words (visualization caps).')
  if (!d || typeof d !== 'object' || typeof d.s !== 'string' || !Array.isArray(d.words)) throw bad()
  const ok = w => typeof w === 'string' && /^[a-z]{1,30}$/.test(w)
  if (!ok(d.s) || d.words.length < 1 || d.words.length > 8 || !d.words.every(ok)) throw bad()
  return { s: d.s, words: [...d.words] }
}
export function buildTrace({ s, words }) {
  const S = runsOf(s)
  const frames = []
  const results = words.map(() => null)
  const push = (phase, activeLine, message, extra = {}) => frames.push({ phase, activeLine, message, results: [...results], word: -1, run: -1, wordRuns: [], ...extra })
  push('start', L('let S be'), `Encode the target as runs: ${S.map(([c, n]) => c + 'x' + n).join(' ')}. A word is stretchy if its runs line up and each can be stretched to the target run.`)
  let count = 0
  words.forEach((w, wi) => {
    const W = runsOf(w)
    const enc = W.map(([c, n]) => c + 'x' + n).join(' ')
    if (W.length !== S.length) {
      results[wi] = false
      push('reject', L('skip w'), `"${w}" has ${W.length} runs (${enc}) but the target has ${S.length}: the letter order differs, so it cannot match.`, { word: wi, wordRuns: W })
      return
    }
    push('word', L('let W be'), `Encode "${w}": ${enc}. Same number of runs as the target, so compare pair by pair.`, { word: wi, wordRuns: W })
    let ok = true
    for (let i = 0; i < S.length; i++) {
      const [a, x] = S[i], [b, y] = W[i]
      const bad = a !== b || x < y || (x !== y && x < 3)
      const why = a !== b ? `letters ${a} and ${b} differ` : x < y ? `target run ${x} is shorter than ${y}` : (x !== y && x < 3) ? `stretching ${y} to ${x} is not allowed (a stretched run needs length 3 or more)` : x === y ? 'equal lengths' : `${y} stretches to ${x} (at least 3)`
      push('compare', L('for each matching pair'), `Run ${i}: target ${a}x${x} vs word ${b}x${y}: ${why}${bad ? '. Mismatch.' : '. OK.'}`, { word: wi, run: i, wordRuns: W })
      if (bad) { ok = false; break }
    }
    results[wi] = ok
    if (ok) count += 1
    push(ok ? 'accept' : 'reject', ok ? L('add 1 to count') : L('set ok to false'), ok ? `"${w}" is stretchy. Count = ${count}.` : `"${w}" is not stretchy. Count stays ${count}.`, { word: wi, wordRuns: W })
  })
  push('done', L('return count'), `${count} of ${words.length} words are stretchy.`)
  return { input: { s, words }, result: count, frames }
}
export const code = `let S be the runs of s, where runs(w) groups equal adjacent letters into (letter, size) pairs
set count to 0
for each word w in words
  let W be runs(w)
  if W has a different number of pairs than S, skip w
  set ok to true
  for each matching pair (a, x) from S and (b, y) from W, in order
    if a is not b, or x < y, or (x is not y and x < 3), set ok to false and stop
  if ok, add 1 to count
return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def expressive_words(s, words):
    def runs(w):
        out = []
        for ch in w:
            if out and out[-1][0] == ch:
                out[-1][1] += 1
            else:
                out.append([ch, 1])
        return out
    S = runs(s)
    count = 0
    for w in words:
        W = runs(w)
        if len(W) != len(S):
            continue
        ok = True
        for (a, x), (b, y) in zip(S, W):
            if a != b or x < y or (x != y and x < 3):
                ok = False
                break
        if ok:
            count += 1
    return count
`
