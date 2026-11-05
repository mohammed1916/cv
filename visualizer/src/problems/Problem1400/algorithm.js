export const phases = [
  { id: 'start', label: 'Start', description: 'Every palindrome needs at most one odd-count letter, so count the letters first.' },
  { id: 'count', label: 'Count letters', description: 'Tally each letter of s.' },
  { id: 'odd', label: 'Odd counts', description: 'Each letter with an odd count needs its own palindrome center.' },
  { id: 'decide', label: 'Enough palindromes', description: 'k palindromes need at least k letters in total, and at most k odd letters.' },
  { id: 'done', label: 'Complete', description: 'Return true when k palindromes are possible.' },
]

export const examples = [
  { label: 'Annabelle in two', input: '{"s":"annabelle","k":2}' },
  { label: 'Too many odd letters', input: '{"s":"leetcode","k":3}' },
  { label: 'Four singles', input: '{"s":"true","k":4}' },
]

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || typeof data.s !== 'string' || !Number.isInteger(data.k)) throw new Error('Use an object with a string s and an integer k, such as {"s":"annabelle","k":2}.')
  if (data.s.length < 1 || data.s.length > 60) throw new Error('s must have 1 to 60 letters in this visualization.')
  if (!/^[a-z]+$/.test(data.s)) throw new Error('s must use lowercase letters only.')
  if (data.k < 1 || data.k > 60) throw new Error('k is an integer from 1 to 60 in this visualization.')
  return { s: data.s, k: data.k }
}

export function buildTrace({ s, k }) {
  if (s.length < k) {
    return { input: { s, k }, result: false, frames: [{ phase: 'start', activeLine: L('const count = new Map()'), pythonLine: P('count = Counter'), snapshot: { rows: [], k, odd: 0 },
      message: `Make ${k} palindromes from ${s.length} letters: impossible, since each palindrome needs a letter.` },
    { phase: 'decide', activeLine: L('return odd <= k'), pythonLine: P('return odd <= k'), snapshot: { rows: [], k, odd: 0, result: false },
      message: `${s.length} letter(s) cannot make ${k} palindromes, so the answer is false.`, result: false }] }
  }
  const count = new Map()
  for (const ch of s) count.set(ch, (count.get(ch) || 0) + 1)
  const rows = () => [...count.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([letter, n]) => ({ letter, count: n, odd: n % 2 === 1 ? 'odd' : '' }))
  const snap = (extra = {}) => ({ rows: rows(), k, odd: 0, ...extra })
  const frames = [{ phase: 'start', activeLine: L('const count = new Map()'), pythonLine: P('count = Counter'), snapshot: snap(),
    message: `Make ${k} palindrome(s) from the ${s.length} letters of ${s}.` }]
  let odd = 0
  for (const [letter, n] of [...count.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (n % 2 === 1) odd++
    frames.push({ phase: 'odd', activeLine: L('if (n % 2 === 1)'), pythonLine: P('if n % 2'), snapshot: snap({ odd, current: letter }),
      message: `${letter} appears ${n} time(s)${n % 2 === 1 ? ', an odd count, so it needs a center' : ', an even count'}. Odd letters so far: ${odd}.` })
  }
  frames.push({ phase: 'decide', activeLine: L('return odd <= k'), pythonLine: P('return odd <= k'), snapshot: snap({ odd }),
    message: `${odd} odd letter(s) against ${k} palindrome(s): ${odd <= k && s.length >= k ? 'enough' : 'not enough'}.` })
  const result = s.length >= k && odd <= k
  frames.push({ phase: 'done', activeLine: L('return odd <= k'), pythonLine: P('return odd <= k'), snapshot: snap({ odd, result }),
    message: `Return ${result}.`, result })
  return { input: { s, k }, result, frames }
}

export const code = `function canConstructKPalindromes(s, k) {
  const count = new Map()
  for (const ch of s) count.set(ch, (count.get(ch) || 0) + 1)
  let odd = 0
  for (const n of count.values()) {
    if (n % 2 === 1) odd++
  }
  return odd <= k && s.length >= k
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `from collections import Counter

def can_construct_k_palindromes(s, k):
    count = Counter(s)
    odd = 0
    for n in count.values():
        if n % 2:
            odd += 1
    return odd <= k and len(s) >= k
`
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1
export const pythonLineMap = { 1: 4, 2: 5, 3: 6, 4: 7, 5: 8, 6: 9, 7: 10, 8: 10 }
