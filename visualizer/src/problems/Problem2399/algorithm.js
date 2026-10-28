export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || Array.isArray(data) || typeof data.s !== 'string' || !Array.isArray(data.distance)) throw new Error('Use {"s": "...", "distance": [26 numbers]}.')
  const { s, distance } = data
  if (s.length < 2 || s.length > 52 || !/^[a-z]+$/.test(s)) throw new Error('s is 2 to 52 lowercase letters.')
  const counts = new Map()
  for (const c of s) counts.set(c, (counts.get(c) ?? 0) + 1)
  if ([...counts.values()].some(n => n !== 2)) throw new Error('Each letter in s appears exactly twice.')
  if (distance.length !== 26 || distance.some(d => !Number.isInteger(d) || d < 0 || d > 50)) throw new Error('distance has 26 integers from 0 to 50, one per letter a to z.')
  return { s, distance }
}

export function buildTrace(input) {
  const { s, distance } = input
  const first = new Map()
  const frames = []
  const maps = () => [{ name: 'first', keyLabel: 'letter', valueLabel: 'first index', isSet: false, entries: [...first] }]
  frames.push({ phase: 'start', activeLine: L('first = empty map'), index: -1, maps: maps(), ops: [], result: null, message: 'Each letter appears twice. The gap between its two copies must equal its distance entry.' })
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (first.has(c)) {
      const gap = i - first.get(c) - 1
      const want = distance[c.charCodeAt(0) - 97]
      const ok = gap === want
      frames.push({ phase: ok ? 'check' : 'fail', activeLine: ok ? L('if distance of c is not gap') : L('return false'), index: i, maps: maps(),
        ops: [{ map: 'first', type: 'lookup', via: 'get', key: c, hit: true, value: first.get(c), hitNote: 'the first copy of this letter is recorded', missNote: 'first copy' }],
        result: ok, message: `${c}: the copies are ${first.get(c)} and ${i}, a gap of ${gap}. distance[${c}] is ${want}, so ${ok ? 'it matches' : 'it does not match and the answer is false'}.` })
      if (!ok) return { input, result: false, frames }
    } else {
      first.set(c, i)
      frames.push({ phase: 'scan', activeLine: L('set first of c to i'), index: i, maps: maps(), ops: [{ map: 'first', type: 'insert', key: c, value: i }], result: null,
        message: `${c} at index ${i} is its first copy. Record the index.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return true'), index: -1, maps: maps(), ops: [], result: true, message: 'Every letter’s gap matches its distance, so the answer is true.' })
  return { input, result: true, frames }
}

export const code = `check whether the gaps between repeated letters match distance
first = empty map from letter to its first index
for each index i with letter c in s
  if c is in first then
    gap = i minus first of c minus 1
    if distance of c is not gap then
      return false
  otherwise
    set first of c to i
return true`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def check_distances(s, distance):
    first = {}
    for i, c in enumerate(s):
        if c in first:
            gap = i - first[c] - 1
            if distance[ord(c) - ord('a')] != gap:
                return False
        else:
            first[c] = i
    return True
`
