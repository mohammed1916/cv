// LeetCode 1682 (draft): Longest Palindromic Subsequence II.
// Input: a lowercase string s (visualization cap: 8 characters). Find the longest subsequence that is a palindrome of
// even length where no two adjacent characters are equal except the central pair. Return 0 when none exists.
// Each layer of the palindrome is a matching pair (s[i], s[j]); the pairs' letters must differ from the layer outside them.

const CODE_TEXT = `FUNCTION longestPalindromicII(s)
    memo ← empty map
    FUNCTION best(l, r, prev)
        IF l is at least r, RETURN 0
        IF (l, r, prev) is already in memo, RETURN the stored value
        result ← 0
        FOR each pair i < j inside l..r
            IF s[i] equals s[j] and s[i] is not prev
                value ← 1 plus best(i + 1, j - 1, s[i])
                result ← the larger of result and value
        store result in memo for (l, r, prev)
        RETURN result
    RETURN 2 times best(0, length of s minus 1, none)`

export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def longest_palindromic_subsequence_ii(s):
    memo = {}

    def best(l, r, prev):
        if l >= r:
            return 0
        key = (l, r, prev)
        if key in memo:
            return memo[key]
        result = 0
        for i in range(l, r):
            for j in range(i + 1, r + 1):
                if s[i] == s[j] and s[i] != prev:
                    result = max(result, 1 + best(i + 1, j - 1, s[i]))
        memo[key] = result
        return result

    return 2 * best(0, len(s) - 1, "")
`

const PY = python.split('\n')
const L = text => {
  const index = code.findIndex(c => c.text.includes(text))
  if (index < 0) throw new Error(`missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = PY.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'enter', label: 'Interval', description: 'Solve the window l..r with the outer letter prev forbidden.' },
  { id: 'pair', label: 'Pair', description: 'Try a matching outer pair i and j as the next layer.' },
  { id: 'store', label: 'Store', description: 'Save the best value for this state.' },
  { id: 'answer', label: 'Answer', description: 'Double the layer count.' },
]

const CAP = 8

export function parseInput(text) {
  const s = text.trim().replace(/^"(.*)"$/, '$1')
  if (!/^[a-z]+$/.test(s) || s.length < 1 || s.length > CAP) throw new Error(`Use 1 to ${CAP} lowercase letters (a string such as abba).`)
  return s
}

// Copy of the memo table for the visual: each solved window with its forbidden letter and best layer count.
function snapshotMemo(memo) {
  return [...memo].map(([key, value]) => {
    const [l, r, prev] = key.split(',')
    return { l: Number(l), r: Number(r), prev, value }
  })
}

export function buildTrace(s) {
  const n = s.length
  const memo = new Map()
  const frames = []
  let calls = 0
  const best = (l, r, prev, depth) => {
    if (l >= r) return 0
    const key = `${l},${r},${prev}`
    if (memo.has(key)) return memo.get(key)
    calls += 1
    frames.push({ pythonLine: P('if l >= r:'), phase: 'enter', activeLine: L('IF l is at least r'), l, r, prev, pair: null, best: 0, memoSize: memo.size, memo: snapshotMemo(memo), message: `Window ${l}..${r} with outer letter ${prev === '' ? 'none' : prev} forbidden.` })
    let result = 0
    for (let i = l; i < r; i++) {
      for (let j = i + 1; j <= r; j++) {
        if (s[i] === s[j] && s[i] !== prev) {
          const inner = best(i + 1, j - 1, s[i], depth + 1)
          const value = 1 + inner
          if (value > result) result = value
          frames.push({ pythonLine: P('result = max(result, 1 +'), phase: 'pair', activeLine: L('IF s[i] equals s[j] and s[i] is not prev'), l, r, prev, pair: [i, j], value, best: result, memoSize: memo.size, memo: snapshotMemo(memo), message: `Pair ${s[i]} at ${i} and ${j} gives 1 + ${inner} = ${value}; best is ${result}.` })
        }
      }
    }
    memo.set(key, result)
    frames.push({ pythonLine: P('memo[key] = result'), phase: 'store', activeLine: L('store result in memo'), l, r, prev, pair: null, best: result, memoSize: memo.size, memo: snapshotMemo(memo), message: `Window ${l}..${r} with ${prev === '' ? 'no' : prev} forbidden: ${result} layer${result === 1 ? '' : 's'}.` })
    return result
  }
  const layers = best(0, n - 1, '', 0)
  const answer = 2 * layers
  frames.push({ pythonLine: P('return 2 * best'), phase: 'answer', activeLine: L('RETURN 2 times best'), l: 0, r: n - 1, prev: '', pair: null, best: layers, memoSize: memo.size, memo: snapshotMemo(memo), message: answer === 0 ? 'No valid palindrome subsequence: answer 0.' : `${layers} layer${layers === 1 ? '' : 's'}: longest length ${answer}.` })
  return { input: s, result: answer, calls, frames }
}
