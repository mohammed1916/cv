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
  const frames = [{ phase: 'start', activeLine: L("return best(0, '', 0, k)"), pythonLine: 25, i: 0, letter: '', run: 0, left: k, value: null, states: 0, message: `Compress ${s}, deleting at most ${k} characters.` }]

  const best = (i, letter, run, left) => {
    if (i >= n) return 0
    const key = `${i}|${letter}|${run}|${left}`
    if (memo.has(key)) {
      const value = memo.get(key)
      frames.push({ phase: 'reuse', activeLine: L('if (memo.has(key))'), pythonLine: 17, i, letter, run, left, value, states: memo.size, message: `Character ${i} with run ${letter || 'none'} x${run} and ${left} deletions left is known.` })
      return value
    }
    frames.push({ phase: 'visit', activeLine: L('let del = Infinity'), pythonLine: 18, i, letter, run, left, value: null, states: memo.size, message: `Character ${i} is ${s[i]}. The current run is ${letter || 'empty'} x${run}, with ${left} deletions left.` })
    let del = Infinity
    if (left > 0) del = best(i + 1, letter, run, left - 1)
    const same = s[i] === letter
    const extra = same ? encoded(run + 1) - encoded(run) : 1
    const keep = extra + best(i + 1, s[i], same ? run + 1 : 1, left)
    const value = Math.min(del, keep)
    memo.set(key, value)
    frames.push({ phase: 'store', activeLine: L('memo.set(key'), pythonLine: 22, i, letter, run, left, value, states: memo.size, message: `Best length from character ${i} is ${value}.` })
    return value
  }

  const result = best(0, '', 0, k)
  frames.push({ phase: 'done', activeLine: L("return best(0, '', 0, k)"), pythonLine: 25, i: n, letter: '', run: 0, left: null, value: result, states: memo.size, message: `Shortest compressed length: ${result}.` })
  return { input, result, frames }
}

const CODE = [
  'function getLengthOfOptimalCompression(s, k) {',
  '  const encoded = x => (x === 0 ? 0 : x === 1 ? 1 : 1 + String(x).length)',
  '  const n = s.length',
  '  const memo = new Map()',
  '  const best = (i, letter, run, left) => {',
  '    if (i >= n) return 0',
  '    const key = `${i}|${letter}|${run}|${left}`',
  '    if (memo.has(key)) return memo.get(key)',
  '    let del = Infinity',
  '    if (left > 0) del = best(i + 1, letter, run, left - 1)',
  '    const same = s[i] === letter',
  '    const extra = same ? encoded(run + 1) - encoded(run) : 1',
  '    const keep = extra + best(i + 1, s[i], same ? run + 1 : 1, left)',
  '    memo.set(key, Math.min(del, keep))',
  '    return memo.get(key)',
  '  }',
  "  return best(0, '', 0, k)",
  '}',
]
export const code = CODE.map((text, index) => ({ line: index + 1, text }))
const L = s => CODE.findIndex(c => c.includes(s)) + 1

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
