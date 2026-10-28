const MAX_WORDS = 10

const oneApart = (a, b) => {
  if (a.length !== b.length) return false
  let diff = 0
  for (let k = 0; k < a.length; k++) if (a[k] !== b[k]) diff++
  return diff === 1
}

export function parseInput(text) {
  const data = JSON.parse(text)
  const { words, groups } = data ?? {}
  if (!Array.isArray(words) || words.length < 1 || words.length > MAX_WORDS || words.some(w => typeof w !== 'string' || !/^[a-z]{1,3}$/.test(w))) throw new Error(`words must be 1 to ${MAX_WORDS} strings of 1 to 3 lowercase letters.`)
  if (!Array.isArray(groups) || groups.length !== words.length || groups.some(g => g !== 0 && g !== 1)) throw new Error('groups must be 0 or 1 for each word.')
  return { words, groups }
}

export const code = `longest chain of words whose groups alternate and differ by one letter
  set dp[i] to 1 and prev[i] to nothing for every index i
  for each index i from 0 to n minus 1
    for each earlier index j from 0 to i minus 1
      if groups[j] differs from groups[i] and words[j] and words[i] differ in exactly one letter then
        if dp[j] plus 1 is greater than dp[i] then
          set dp[i] to dp[j] plus 1 and prev[i] to j
  set end to the first index with the largest dp
  walk prev backwards from end and collect the words
  return the collected words in forward order`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ words, groups }) {
  const n = words.length
  const dp = Array(n).fill(1)
  const prev = Array(n).fill(-1)
  const frames = [{ phase: 'start', index: -1, dp: [...dp], from: null, activeLine: L('set dp[i] to 1'), message: 'Every word alone is a chain of length 1.' }]
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < i; j++) {
      if (groups[j] !== groups[i] && oneApart(words[j], words[i]) && dp[j] + 1 > dp[i]) {
        dp[i] = dp[j] + 1
        prev[i] = j
        frames.push({ phase: 'link', index: i, dp: [...dp], from: j, activeLine: L('set dp[i] to dp[j] plus 1'), message: `Extend ${words[j]} to ${words[i]}: chain length ${dp[i]}.` })
      }
    }
  }
  let end = 0
  for (let i = 0; i < n; i++) if (dp[i] > dp[end]) end = i
  frames.push({ phase: 'end', index: end, dp: [...dp], from: null, activeLine: L('set end to the first'), message: `The longest chain ends at ${words[end]}, length ${dp[end]}.` })
  const chain = []
  for (let cur = end; cur !== -1; cur = prev[cur]) chain.push(words[cur])
  chain.reverse()
  frames.push({ phase: 'done', index: end, dp: [...dp], from: null, activeLine: L('return the collected words'), message: `Chain: ${chain.join(', ')}.` })
  return { input: { words, groups }, result: chain, frames }
}

export const python = `def longest_unequal_groups_ii(words, groups):
    n = len(words)
    dp = [1] * n
    prev = [-1] * n
    for i in range(n):
        for j in range(i):
            if groups[j] != groups[i] and len(words[j]) == len(words[i]) and sum(a != b for a, b in zip(words[j], words[i])) == 1:
                if dp[j] + 1 > dp[i]:
                    dp[i] = dp[j] + 1
                    prev[i] = j
    end = 0
    for i in range(n):
        if dp[i] > dp[end]:
            end = i
    chain = []
    cur = end
    while cur != -1:
        chain.append(words[cur])
        cur = prev[cur]
    return chain[::-1]
`
