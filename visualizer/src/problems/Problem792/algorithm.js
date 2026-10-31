export function parseInput(text) {
  const v = JSON.parse(text)
  const err = 'Enter {"s":"abcde","words":["a","bb","acd"]}: lowercase letters only, s has 1-40 letters, 1-10 words of 1-10 letters.'
  if (!v || typeof v.s !== 'string' || !Array.isArray(v.words)) throw new Error(err)
  if (!/^[a-z]{1,40}$/.test(v.s) || v.words.length < 1 || v.words.length > 10 || !v.words.every(w => typeof w === 'string' && /^[a-z]{1,10}$/.test(w))) throw new Error(err)
  return { s: v.s, words: v.words }
}
export function buildTrace({ s, words }) {
  const waiting = new Map()
  const add = (ch, w, i) => { if (!waiting.has(ch)) waiting.set(ch, []); waiting.get(ch).push([w, i]) }
  const show = () => [...waiting.entries()].filter(([, l]) => l.length).map(([ch, l]) => `${ch}: ${l.map(([w, i]) => `${w}@${i}`).join(' ')}`)
  words.forEach(w => add(w[0], w, 0))
  let count = 0
  const frames = [{ phase: 'start', activeLine: 2, pythonLine: 4, pos: -1, count, buckets: show(), message: 'Every word waits for its first letter. A bucket maps a letter to the words (with progress index) waiting for it.' }]
  for (let p = 0; p < s.length; p++) {
    const ch = s[p]
    const bucket = waiting.get(ch) || []
    waiting.delete(ch)
    frames.push({ phase: 'scan', activeLine: 4, pythonLine: 7, pos: p, count, buckets: [`took ${ch}: ${bucket.map(([w, i]) => `${w}@${i}`).join(' ') || '(none waiting)'}`, ...show()], message: bucket.length ? `Read "${ch}" at index ${p}: ${bucket.length} word(s) were waiting for it.` : `Read "${ch}" at index ${p}: no word is waiting for it, nothing moves.` })
    for (const [w, i] of bucket) {
      if (i + 1 === w.length) {
        count++
        frames.push({ phase: 'complete', activeLine: 7, pythonLine: 10, pos: p, count, buckets: show(), message: `"${w}" matched its last letter: it is a subsequence. Count = ${count}.` })
      } else {
        add(w[i + 1], w, i + 1)
        frames.push({ phase: 'advance', activeLine: 8, pythonLine: 12, pos: p, count, buckets: show(), message: `"${w}" matched letter ${i + 1} of ${w.length}; it now waits for "${w[i + 1]}".` })
      }
    }
  }
  frames.push({ phase: 'done', activeLine: 9, pythonLine: 13, pos: s.length, count, buckets: show(), message: `${count} word(s) are subsequences of s.` })
  return { input: { s, words }, result: count, frames }
}
export const code = `set count to 0
for each word w: put (w, 0) in the bucket for letter w[0]
for each character ch in s
  take the bucket for ch and empty it
  for each (w, i) taken from that bucket
    if i + 1 equals the length of w then
      add 1 to count
    otherwise put (w, i + 1) in the bucket for letter w[i + 1]
return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
export const python = `def num_matching_subseq(s, words):
    waiting = {}
    for w in words:
        waiting.setdefault(w[0], []).append((w, 0))
    count = 0
    for ch in s:
        bucket = waiting.pop(ch, [])
        for w, i in bucket:
            if i + 1 == len(w):
                count += 1
            else:
                waiting.setdefault(w[i + 1], []).append((w, i + 1))
    return count
`
