const FACT = [1n]
const fact = n => {
  while (FACT.length <= n) FACT.push(FACT[FACT.length - 1] * BigInt(FACT.length))
  return FACT[n]
}
// Distinct arrangements of a multiset of letter counts: total! divided by each count factorial.
const arrangements = h => {
  let total = 0
  let denom = 1n
  for (const x of h) {
    total += x
    denom *= fact(x)
  }
  return fact(total) / denom
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || typeof input.s !== 'string' || !Number.isInteger(input.k)) {
    throw new Error('Use an object such as {"s": "abba", "k": 2}.')
  }
  const { s, k } = input
  if (s.length < 1 || s.length > 60) throw new Error('s needs 1 to 60 letters for the visualization.')
  if (!/^[a-z]+$/.test(s)) throw new Error('s uses lowercase letters only.')
  if (s !== [...s].reverse().join('')) throw new Error('s must be a palindrome.')
  if (k < 1 || k > 1000000) throw new Error('k is an integer from 1 to 1000000.')
  return { s, k }
}

export function buildTrace({ s, k }) {
  const input = { s, k }
  const counts = Array(26).fill(0)
  for (const ch of s) counts[ch.charCodeAt(0) - 97] += 1
  const h = counts.map(c => Math.floor(c / 2))
  const middle = counts.map((c, i) => (c % 2 === 1 ? String.fromCharCode(97 + i) : '')).join('')
  let rank = BigInt(k)
  const frames = [{ phase: 'start', activeLine: L('count the letters'), left: '', rank: Number(rank), message: 'Only the left half matters: the palindrome is fixed by its half and the middle letter.' }]
  if (arrangements(h) < rank) {
    frames.push({ phase: 'none', activeLine: L('return the empty string'), left: '', rank: Number(rank), message: `There are fewer than ${k} palindromes, so the answer is empty.` })
    return { input, result: '', frames }
  }
  let left = ''
  const total = h.reduce((a, b) => a + b, 0)
  for (let pos = 0; pos < total; pos++) {
    for (let c = 0; c < 26; c++) {
      if (h[c] === 0) continue
      h[c] -= 1
      const block = arrangements(h)
      if (rank <= block) {
        left += String.fromCharCode(97 + c)
        frames.push({ phase: 'place', activeLine: L('append c to left'), left, rank: Number(rank), message: `Choose ${String.fromCharCode(97 + c)} next: its block holds ${block} palindromes and contains the target.` })
        break
      }
      rank -= block
      h[c] += 1
      frames.push({ phase: 'skip', activeLine: L('subtract block from k'), left, rank: Number(rank), message: `Skip the ${String.fromCharCode(97 + c)} block of ${block} palindromes. k becomes ${rank}.` })
    }
  }
  const result = left + middle + [...left].reverse().join('')
  frames.push({ phase: 'done', activeLine: L('return left, then middle'), left, rank: Number(rank), message: `The ${k}-th palindrome is ${result}.` })
  return { input, result, frames }
}

export const code = `k-th smallest distinct palindromic rearrangement of s
  count the letters and keep half of each count in h
  find the middle letter if one count is odd
  if there are fewer than k distinct left halves
    return the empty string
  set left to an empty string
  repeat once for each letter of the left half
    for each letter c that is still available in order
      remove one c from h and count the arrangements of the rest as block
      if k is at most block then
        append c to left and stop the search for this position
      otherwise subtract block from k and put c back
  return left, then middle, then left reversed`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from math import factorial

def kth_palindromic_rearrangement(s, k):
    counts = [0] * 26
    for ch in s:
        counts[ord(ch) - 97] += 1
    h = [c // 2 for c in counts]
    middle = ''.join(chr(97 + i) for i in range(26) if counts[i] % 2 == 1)

    def arrangements(parts):
        denom = 1
        for x in parts:
            denom *= factorial(x)
        return factorial(sum(parts)) // denom

    if arrangements(h) < k:
        return ''
    rank = k
    left = []
    for _ in range(sum(h)):
        for c in range(26):
            if h[c] == 0:
                continue
            h[c] -= 1
            block = arrangements(h)
            if rank <= block:
                left.append(chr(97 + c))
                break
            rank -= block
            h[c] += 1
    half = ''.join(left)
    return half + middle + half[::-1]
`
