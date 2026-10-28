const MOD = 1000000007
const LETTERS = /^[a-z]+$/

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.words) || data.words.length < 1 || data.words.length > 6) throw new Error('Use words as an array of 1 to 6 strings.')
  const length = data.words[0].length
  if (data.words.some(w => typeof w !== 'string' || w.length !== length || length < 1 || length > 6 || !LETTERS.test(w))) {
    throw new Error('Every word must have the same length, from 1 to 6 lowercase letters.')
  }
  if (typeof data.target !== 'string' || data.target.length < 1 || data.target.length > 6 || !LETTERS.test(data.target)) throw new Error('Use a target of 1 to 6 lowercase letters.')
  return { words: data.words, target: data.target }
}

export function buildTrace({ words, target }) {
  const length = words[0].length
  const m = target.length
  const cnt = Array.from({ length }, () => Array(26).fill(0))
  for (const word of words) for (let k = 0; k < length; k++) cnt[k][word.charCodeAt(k) - 97]++
  const countsAt = k => [...new Set(words.map(w => w[k]))].sort().map(ch => [ch, words.filter(w => w[k] === ch).length])
  const dp = Array.from({ length: m + 1 }, () => Array(length + 1).fill(0))
  for (let k = 0; k <= length; k++) dp[0][k] = 1
  const snap = () => dp.map(row => [...row])
  const frames = [{ phase: 'count', activeLine: L('count how many words have each letter'), i: -1, k: -1, dp: snap(), columns: countsAt, message: `Each word has ${length} column(s); count the letters in each column.` }]
  frames.push({ phase: 'base', activeLine: L('set the empty-prefix row'), i: 0, k: -1, dp: snap(), columns: countsAt, message: 'An empty target can be built in exactly one way, so row 0 is all ones.' })
  for (let i = 1; i <= m; i++) {
    for (let k = 1; k <= length; k++) {
      const skip = dp[i][k - 1]
      const use = dp[i - 1][k - 1] * cnt[k - 1][target.charCodeAt(i - 1) - 97]
      dp[i][k] = (skip + use) % MOD
      frames.push({ phase: 'fill', activeLine: L('add the ways that use'), i, k, dp: snap(), columns: countsAt, message: `Building ${target.slice(0, i)} from the first ${k} column(s): skip column ${k - 1} gives ${skip}, use it for ${target[i - 1]} gives ${use}.` })
    }
  }
  const result = dp[m][length]
  frames.push({ phase: 'done', activeLine: L('return the ways for the full target'), i: m, k: length, dp: snap(), columns: countsAt, result, message: `Ways to build ${target}: ${result}.` })
  return { input: { words, target }, result, frames }
}

export const code = `count the ways to build the target from the words
  count how many words have each letter in each column
  set the empty-prefix row to one way in every column
  for each prefix length i of the target from 1 up
    for each column count k from 1 up
      add the ways that skip column k minus one
      add the ways that use column k minus one for letter i of the target, times its count
  return the ways for the full target across every column`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def num_ways_to_form_target(words, target):
    MOD = 10 ** 9 + 7
    length = len(words[0])
    m = len(target)
    cnt = [[0] * 26 for _ in range(length)]
    for word in words:
        for k, ch in enumerate(word):
            cnt[k][ord(ch) - 97] += 1
    dp = [[0] * (length + 1) for _ in range(m + 1)]
    for k in range(length + 1):
        dp[0][k] = 1
    for i in range(1, m + 1):
        for k in range(1, length + 1):
            use = dp[i - 1][k - 1] * cnt[k - 1][ord(target[i - 1]) - 97]
            dp[i][k] = (dp[i][k - 1] + use) % MOD
    return dp[m][length]
`
