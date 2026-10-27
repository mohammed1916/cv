const LETTERS = ['a', 'b', 'c']

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input.s !== 'string' || !Number.isInteger(input.k)) throw new Error('Use an object with a string s and an integer k.')
  if (input.s.length < 1 || input.s.length > 40) throw new Error('s must have 1 to 40 characters.')
  if (![...input.s].every(ch => LETTERS.includes(ch))) throw new Error('s may only contain the letters a, b and c.')
  if (input.k < 0 || input.k > input.s.length) throw new Error('k must be from 0 up to the length of s.')
  return { s: input.s, k: input.k }
}

export function buildTrace({ s, k }) {
  const n = s.length
  const total = { a: 0, b: 0, c: 0 }
  for (const ch of s) total[ch]++
  const frames = []
  const short = LETTERS.find(ch => total[ch] < k)
  frames.push({ phase: 'count', activeLine: L('count how many'), left: 0, right: -1, win: { a: 0, b: 0, c: 0 }, longest: 0, message: `Counts: a=${total.a}, b=${total.b}, c=${total.c}. Each needs at least ${k} left.` })
  if (short) {
    frames.push({ phase: 'done', activeLine: L('return -1'), left: 0, right: -1, win: { a: 0, b: 0, c: 0 }, longest: 0, result: -1, message: `${short} appears only ${total[short]} times, so the goal is impossible.` })
    return { input: { s, k }, total, result: -1, frames }
  }
  const win = { a: 0, b: 0, c: 0 }
  const over = () => LETTERS.some(ch => win[ch] > total[ch] - k)
  let left = 0
  let longest = 0
  for (let right = 0; right < n; right++) {
    win[s[right]]++
    frames.push({ phase: 'extend', activeLine: L('add the letter'), left, right, win: { ...win }, longest, message: `Add ${s[right]} at position ${right} to the removed window.` })
    while (over()) {
      win[s[left]]--
      left++
      frames.push({ phase: 'shrink', activeLine: L('while the removed window'), left, right, win: { ...win }, longest, message: `Too many letters are removed, so position ${left - 1} returns to the ends.` })
    }
    if (right - left + 1 > longest) longest = right - left + 1
    frames.push({ phase: 'record', activeLine: L('remember the longest'), left, right, win: { ...win }, longest, message: `Longest removable window so far: ${longest}.` })
  }
  const result = n - longest
  frames.push({ phase: 'done', activeLine: L('return length of s'), left, right: n - 1, win: { ...win }, longest, result, message: `Remove ${n} - ${longest} = ${result} characters from the ends.` })
  return { input: { s, k }, total, result, frames }
}

export const code = `take k of each letter from the two ends (s, k):
  count how many a, b and c the string has
  if some letter has fewer than k then return -1
  set the removed window to empty
  for each position right in s
    add the letter at right to the removed window
    while the removed window holds too many of some letter
      take the letter at the left edge of the window out of the window
    remember the longest removed window seen so far
  return length of s minus the longest removed window`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def take_characters(s, k):
    total = {ch: s.count(ch) for ch in 'abc'}
    if any(total[ch] < k for ch in 'abc'):
        return -1
    win = {ch: 0 for ch in 'abc'}
    left = 0
    longest = 0
    for right, ch in enumerate(s):
        win[ch] += 1
        while any(win[c] > total[c] - k for c in 'abc'):
            win[s[left]] -= 1
            left += 1
        longest = max(longest, right - left + 1)
    return len(s) - longest
`
