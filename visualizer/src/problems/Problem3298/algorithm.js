export function parseInput(text) {
  const input = JSON.parse(text)
  if (typeof input?.word1 !== 'string' || input.word1.length < 1 || input.word1.length > 16 || !/^[a-z]+$/.test(input.word1)) throw new Error('Give word1 as 1 to 16 lowercase letters.')
  if (typeof input?.word2 !== 'string' || input.word2.length < 1 || input.word2.length > 5 || !/^[a-z]+$/.test(input.word2)) throw new Error('Give word2 as 1 to 5 lowercase letters.')
  return { word1: input.word1, word2: input.word2 }
}

export function buildTrace({ word1, word2 }) {
  const n = word1.length
  const need = new Map()
  for (const c of word2) need.set(c, (need.get(c) ?? 0) + 1)
  const have = new Map()
  const covers = () => [...need].every(([c, amount]) => (have.get(c) ?? 0) >= amount)
  const label = () => [...have].map(([c, k]) => `${c}${k}`).join(' ')
  const frames = [{ phase: 'start', activeLine: L('set need to'), left: 0, right: 0, have: '', total: 0, message: `Grow a window until it covers ${word2}. Every later end then works too.` }]
  let right = 0, total = 0
  for (let left = 0; left < n; left++) {
    while (right < n && !covers()) {
      have.set(word1[right], (have.get(word1[right]) ?? 0) + 1)
      right++
      frames.push({ phase: 'extend', activeLine: L('add the letter at right'), left, right, have: label(), total, message: `Add ${word1[right - 1]}. The window ${left} to ${right - 1} ${covers() ? 'covers' : 'does not yet cover'} ${word2}.` })
    }
    if (covers()) {
      total += n - right + 1
      frames.push({ phase: 'count', activeLine: L('add word1 length minus right'), left, right, have: label(), total, message: `Ends ${right - 1} to ${n - 1} all work for start ${left}. Total ${total}.` })
    }
    const out = word1[left]
    have.set(out, have.get(out) - 1)
    if (have.get(out) === 0) have.delete(out)
    frames.push({ phase: 'shrink', activeLine: L('remove the letter at left'), left: left + 1, right, have: label(), total, message: `Remove ${out} from the left. The next start is ${left + 1}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return total'), left: n, right, have: '', total, message: `There are ${total} qualifying substrings.` })
  return { input: { word1, word2 }, result: total, frames }
}

export const code = `count substrings that cover word2 (word1, word2)
  set need to the letter counts of word2
  set counts to an empty map and right to zero
  set total to zero
  for each left index
    while right is inside word1 and the window does not cover word2
      add the letter at right and move right one step
    if the window covers word2 then add word1 length minus right plus one to total
    remove the letter at left from the window
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_covering_substrings(word1, word2):
    need = {}
    for ch in word2:
        need[ch] = need.get(ch, 0) + 1
    def covers(have):
        return all(have.get(ch, 0) >= amount for ch, amount in need.items())
    have = {}
    n = len(word1)
    right = 0
    total = 0
    for left in range(n):
        while right < n and not covers(have):
            have[word1[right]] = have.get(word1[right], 0) + 1
            right += 1
        if covers(have):
            total += n - right + 1
        have[word1[left]] -= 1
        if have[word1[left]] == 0:
            del have[word1[left]]
    return total
`
