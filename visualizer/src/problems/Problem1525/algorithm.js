export const phases = [
  { id: 'start', label: 'Start', description: 'Each split point needs the number of distinct letters on both sides.' },
  { id: 'prefix', label: 'Prefix counts', description: 'Scan left to right, recording how many distinct letters each prefix holds.' },
  { id: 'suffix', label: 'Suffix counts', description: 'Scan right to left, recording how many distinct letters each suffix holds.' },
  { id: 'compare', label: 'Compare split', description: 'For each split, compare the left prefix count with the right suffix count.' },
  { id: 'count', label: 'Good split', description: 'Equal counts make this split good.' },
  { id: 'done', label: 'Complete', description: 'Return the number of good splits.' },
]

export function parseInput(text) {
  const s = text.trim()
  if (!/^[a-z]{1,200}$/.test(s)) throw new Error('Enter 1 to 200 lowercase letters a to z.')
  return { s }
}

export const code = `count good splits (s):
  n = length of s
  seen = empty set
  for i from 0 to n-1:
    add s[i] to seen; left[i] = size of seen
  seen = empty set
  for i from n-1 down to 0:
    add s[i] to seen; right[i] = size of seen
  good = 0
  for i from 0 to n-2:
    if left[i] == right[i+1]: good += 1
  return good`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def num_splits(s):
    n = len(s)
    left, right = [0] * n, [0] * n
    seen = set()
    for i, ch in enumerate(s):
        seen.add(ch)
        left[i] = len(seen)
    seen = set()
    for i in range(n - 1, -1, -1):
        seen.add(s[i])
        right[i] = len(seen)
    good = 0
    for i in range(n - 1):
        if left[i] == right[i + 1]:
            good += 1
    return good
`

const PS = { start: 1, prefix: 5, suffix: 8, compare: 11, count: 11, done: 12 }
const PY = { start: 1, prefix: 7, suffix: 11, compare: 14, count: 15, done: 16 }

export function buildTrace({ s }) {
  const n = s.length
  const left = new Array(n).fill(null)
  const right = new Array(n).fill(null)
  const frames = [{ phase: 'start', activeLine: PS.start, pythonLine: PY.start, snapshot: { pos: null, left: left.slice(), right: right.slice(), split: null, good: 0 }, message: 'For each split, compare the distinct letters left of it with those right of it.' }]
  let seen = new Set()
  for (let i = 0; i < n; i++) {
    seen.add(s[i])
    left[i] = seen.size
    frames.push({ phase: 'prefix', activeLine: PS.prefix, pythonLine: PY.prefix, snapshot: { pos: i, left: left.slice(), right: right.slice(), split: null, good: 0 }, message: `Prefix through position ${i} ("${s[i]}") has ${left[i]} distinct letters.` })
  }
  seen = new Set()
  for (let i = n - 1; i >= 0; i--) {
    seen.add(s[i])
    right[i] = seen.size
    frames.push({ phase: 'suffix', activeLine: PS.suffix, pythonLine: PY.suffix, snapshot: { pos: i, left: left.slice(), right: right.slice(), split: null, good: 0 }, message: `Suffix from position ${i} ("${s[i]}") has ${right[i]} distinct letters.` })
  }
  let good = 0
  for (let i = 0; i < n - 1; i++) {
    const matched = left[i] === right[i + 1]
    frames.push({ phase: 'compare', activeLine: PS.compare, pythonLine: PY.compare, snapshot: { pos: i, left: left.slice(), right: right.slice(), split: i, good, matched }, message: `Split after position ${i}: left has ${left[i]} distinct, right has ${right[i + 1]}. ${matched ? 'Equal, so this is good.' : 'Not equal.'}` })
    if (matched) {
      good += 1
      frames.push({ phase: 'count', activeLine: PS.count, pythonLine: PY.count, snapshot: { pos: i, left: left.slice(), right: right.slice(), split: i, good, matched }, message: `Good splits so far: ${good}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: PS.done, pythonLine: PY.done, snapshot: { pos: null, left: left.slice(), right: right.slice(), split: null, good }, message: `Good splits: ${good}.` })
  return { input: { s }, result: good, frames }
}
