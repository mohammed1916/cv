export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Enter an object with n and k.')
  const { n, k } = input
  if (!Number.isInteger(n) || n < 1 || n > 8) throw new Error('n is an integer from 1 to 8.')
  const total = countAll(n)
  if (!Number.isInteger(k) || k < 1 || k > total) throw new Error(`k is an integer from 1 to ${total} (the number of alternating permutations of ${n}).`)
  return { n, k }
}

// Number of ways to place the remaining odds and evens, given the parity of the element just placed (2 = none yet).
function completions(odds, evens, last, memo = new Map()) {
  if (odds === 0 && evens === 0) return 1
  const key = `${odds},${evens},${last}`
  if (memo.has(key)) return memo.get(key)
  let total = 0
  if (odds > 0 && last !== 1) total += completions(odds - 1, evens, 1, memo)
  if (evens > 0 && last !== 0) total += completions(odds, evens - 1, 0, memo)
  memo.set(key, total)
  return total
}

const factorial = m => (m <= 1 ? 1 : m * factorial(m - 1))

// Number of permutations (not parity patterns): each pattern fixes the parities, and values fill them in any order.
function ways(odds, evens, last) {
  return completions(odds, evens, last) * factorial(odds) * factorial(evens)
}

function countAll(n) {
  return ways(Math.ceil(n / 2), Math.floor(n / 2), 2)
}

export function buildTrace({ n, k }) {
  let rest = k
  let odds = Math.ceil(n / 2), evens = Math.floor(n / 2)
  let last = 2
  const used = Array(n + 1).fill(false)
  const perm = []
  const frames = [{ phase: 'start', position: null, candidates: [], chosen: null, prefix: [], rest, activeLine: L('set prefix to'), message: `Find permutation number ${k} among the alternating ones, in lexicographic order.` }]
  for (let pos = 0; pos < n; pos++) {
    const candidates = []
    let chosen = null
    for (let v = 1; v <= n && chosen === null; v++) {
      if (used[v]) continue
      const p = v % 2
      if (last !== 2 && p === last) { candidates.push({ value: v, count: 0, skipped: 'same parity' }); continue }
      const count = ways(odds - (p === 1 ? 1 : 0), evens - (p === 0 ? 1 : 0), p)
      if (rest <= count) {
        chosen = v
        candidates.push({ value: v, count, chosen: true })
      } else {
        rest -= count
        candidates.push({ value: v, count, skipped: 'too early' })
      }
    }
    if (chosen === null) throw new Error('internal: no candidate')
    used[chosen] = true
    perm.push(chosen)
    if (chosen % 2 === 1) odds--; else evens--
    last = chosen % 2
    frames.push({ phase: 'place', position: pos, candidates, chosen, prefix: perm.slice(), rest, activeLine: L('place the value'), message: `Position ${pos + 1}: ${chosen} is the next value; its block has ${candidates.find(c => c.chosen).count} completions.` })
  }
  frames.push({ phase: 'done', position: null, candidates: [], chosen: null, prefix: perm.slice(), rest, activeLine: L('return the permutation'), message: `Permutation ${k}: [${perm.join(', ')}].` })
  return { input: { n, k }, result: perm, frames }
}

export const code = `find the k-th alternating permutation of 1 to n in lexicographic order
  set prefix to an empty list and rest to k
  for each position from left to right
    for each unused value v in increasing order
      skip v if it has the same parity as the previous value
      count the completions that start with v
      if rest is at most that count then place the value v
      otherwise subtract the count from rest and try the next value
  return the permutation`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def permute_alternating(n, k):
    from functools import lru_cache
    from math import factorial

    @lru_cache(maxsize=None)
    def completions(odds, evens, last):
        if odds == 0 and evens == 0:
            return 1
        total = 0
        if odds > 0 and last != 1:
            total += completions(odds - 1, evens, 1)
        if evens > 0 and last != 0:
            total += completions(odds, evens - 1, 0)
        return total

    rest = k
    odds = (n + 1) // 2
    evens = n // 2
    last = 2
    used = [False] * (n + 1)
    perm = []
    for _ in range(n):
        for v in range(1, n + 1):
            if used[v]:
                continue
            p = v % 2
            if last != 2 and p == last:
                continue
            o2 = odds - (1 if p == 1 else 0)
            e2 = evens - (1 if p == 0 else 0)
            count = completions(o2, e2, p) * factorial(o2) * factorial(e2)
            if rest <= count:
                used[v] = True
                perm.append(v)
                odds -= p
                evens -= 1 - p
                last = p
                break
            rest -= count
    return perm
`
