export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with s and k.')
  const { s, k } = data
  if (typeof s !== 'string' || s.length < 1 || s.length > 12) throw new Error('s is a string of 1 to 12 lowercase letters.')
  if (!/^[a-z]+$/.test(s)) throw new Error('s may contain only lowercase letters a to z.')
  if (!Number.isInteger(k) || k < 0 || k > s.length) throw new Error('k is an integer from 0 to the length of s.')
  return { s, k }
}

// Digits written for a run of this length: a single letter, or the letter plus its count.
const encoded = x => (x === 0 ? 0 : x === 1 ? 1 : 1 + String(x).length)

export function buildTrace(input) {
  const { s, k } = input
  const n = s.length
  const memo = new Map()
  const frames = [{ phase: 'start', activeLine: L('return best(0'), i: 0, letter: '', run: 0, left: k, value: null, states: 0, message: `Compress ${s}, deleting at most ${k} characters.` }]

  const best = (i, letter, run, left) => {
    if (i >= n) return 0
    const key = `${i}|${letter}|${run}|${left}`
    if (memo.has(key)) {
      const value = memo.get(key)
      frames.push({ phase: 'reuse', activeLine: L('if memo already holds'), i, letter, run, left, value, states: memo.size, message: `Character ${i} with run ${letter || 'none'} x${run} and ${left} deletions left is known.` })
      return value
    }
    frames.push({ phase: 'visit', activeLine: L('set delete to infinity'), i, letter, run, left, value: null, states: memo.size, message: `Character ${i} is ${s[i]}. The current run is ${letter || 'empty'} x${run}, with ${left} deletions left.` })
    let del = Infinity
    if (left > 0) del = best(i + 1, letter, run, left - 1)
    const same = s[i] === letter
    const extra = same ? encoded(run + 1) - encoded(run) : 1
    const keep = extra + best(i + 1, s[i], same ? run + 1 : 1, left)
    const value = Math.min(del, keep)
    memo.set(key, value)
    frames.push({ phase: 'store', activeLine: L('store the smaller'), i, letter, run, left, value, states: memo.size, message: `Best length from character ${i} is ${value}.` })
    return value
  }

  const result = best(0, '', 0, k)
  frames.push({ phase: 'done', activeLine: L('return best(0'), i: n, letter: '', run: 0, left: null, value: result, states: memo.size, message: `Shortest compressed length: ${result}.` })
  return { input, result, frames }
}

export const code = `shortest compressed length after deleting at most k characters
  return best(0, no letter, run of 0, k)

best(i, letter, run, left)
  if i is past the end of the string then return 0
  if memo already holds this state then return it
  set delete to infinity
  if left is above 0 then set delete to best(i + 1, letter, run, left - 1)
  set extra to the growth in the encoded run if character i joins the run, or 1 for a new run
  set keep to extra plus best(i + 1, character i, the new run length, left)
  store the smaller of delete and keep, then return it`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_length(s, k):
    def encoded(x):
        if x == 0:
            return 0
        if x == 1:
            return 1
        return 1 + len(str(x))

    n = len(s)
    memo = {}

    def best(i, letter, run, left):
        if i >= n:
            return 0
        key = (i, letter, run, left)
        if key in memo:
            return memo[key]
        delete = best(i + 1, letter, run, left - 1) if left > 0 else float('inf')
        same = s[i] == letter
        extra = encoded(run + 1) - encoded(run) if same else 1
        keep = extra + best(i + 1, s[i], run + 1 if same else 1, left)
        memo[key] = min(delete, keep)
        return memo[key]

    return best(0, '', 0, k)
`
