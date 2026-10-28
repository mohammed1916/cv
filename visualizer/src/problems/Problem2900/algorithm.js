const MAX_WORDS = 10

export function parseInput(text) {
  const data = JSON.parse(text)
  const { words, groups } = data ?? {}
  if (!Array.isArray(words) || words.length < 1 || words.length > MAX_WORDS || words.some(w => typeof w !== 'string' || !/^[a-z]{1,3}$/.test(w))) throw new Error(`words must be 1 to ${MAX_WORDS} strings of 1 to 3 lowercase letters.`)
  if (!Array.isArray(groups) || groups.length !== words.length || groups.some(g => g !== 0 && g !== 1)) throw new Error('groups must be 0 or 1 for each word.')
  return { words, groups }
}

export const code = `longest subsequence whose neighbouring groups differ
  set chain to an empty list and last group to nothing
  for each index i from 0 to n minus 1
    if chain is empty, or groups[i] is not equal to last group then
      append words[i] to chain
      set last group to groups[i]
  return chain`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export function buildTrace({ words, groups }) {
  const chain = []
  let last = null
  const frames = [{ phase: 'start', index: -1, chain: [], activeLine: L('set chain to'), message: 'Start with an empty chain.' }]
  words.forEach((w, i) => {
    if (last === null || groups[i] !== last) {
      chain.push(w)
      last = groups[i]
      frames.push({ phase: 'take', index: i, chain: [...chain], activeLine: L('append words[i]'), message: `Group ${groups[i]} differs from the last taken group, so take ${w}.` })
    } else {
      frames.push({ phase: 'skip', index: i, chain: [...chain], activeLine: L('if chain is empty'), message: `${w} is in group ${groups[i]}, the same as the last taken word, so skip it.` })
    }
  })
  frames.push({ phase: 'done', index: words.length - 1, chain: [...chain], activeLine: L('return chain'), message: `Chain length ${chain.length}.` })
  return { input: { words, groups }, result: chain, frames }
}

export const python = `def longest_unequal_groups_i(words, groups):
    chain = []
    last = None
    for w, g in zip(words, groups):
        if last is None or g != last:
            chain.append(w)
            last = g
    return chain
`
