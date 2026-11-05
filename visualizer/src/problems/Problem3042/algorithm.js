const MAX_WORDS = 6
const MAX_LENGTH = 6

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.words)) throw new Error('Use an object like {"words":["a","aba"]}.')
  if (data.words.length < 1 || data.words.length > MAX_WORDS) throw new Error(`Use 1 to ${MAX_WORDS} words.`)
  if (data.words.some(w => typeof w !== 'string' || !/^[a-z]{1,6}$/.test(w))) throw new Error(`Each word is 1 to ${MAX_LENGTH} lowercase letters.`)
  return { words: data.words }
}

export function buildTrace({ words }) {
  let count = 0
  const frames = [{ pythonLine: 2, phase: 'start', activeLine: L('let count = 0'), i: -1, j: -1, match: false, count, message: 'Start with no pairs counted.' }]
  for (let i = 0; i < words.length; i++) {
    for (let j = i + 1; j < words.length; j++) {
      const match = words[j].startsWith(words[i]) && words[j].endsWith(words[i])
      if (match) count++
      frames.push({ pythonLine: match ? 6 : 5, phase: 'pair', activeLine: L('if (words[j].startsWith'), i, j, match, count, message: `${words[i]} ${match ? 'is' : 'is not'} both a prefix and a suffix of ${words[j]}.` })
    }
  }
  frames.push({ pythonLine: 7, phase: 'done', activeLine: L('return count'), i: -1, j: -1, match: false, count, message: `Pairs: ${count}.` })
  return { input: { words }, result: count, frames }
}

export const code = `function countPrefixSuffixPairs(words) {
  let count = 0
  for (let i = 0; i < words.length; i++) {
    for (let j = i + 1; j < words.length; j++) {
      if (words[j].startsWith(words[i]) && words[j].endsWith(words[i])) count++
    }
  }
  return count
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_prefix_suffix_pairs(words):
    count = 0
    for i in range(len(words)):
        for j in range(i + 1, len(words)):
            if words[j].startswith(words[i]) and words[j].endswith(words[i]):
                count += 1
    return count
`
