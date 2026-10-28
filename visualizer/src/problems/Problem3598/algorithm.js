export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with words, for example {"words":["jump","run","run","jump","run"]}.')
  const { words } = data
  if (!Array.isArray(words) || words.length < 1 || words.length > 8) throw new Error('words must have 1 to 8 entries.')
  if (words.some(w => typeof w !== 'string' || w.length < 1 || w.length > 5 || !/^[a-z]+$/.test(w))) throw new Error('Each word is 1 to 5 lowercase letters.')
  return { words: [...words] }
}

const lcp = (a, b) => {
  let i = 0
  while (i < a.length && i < b.length && a[i] === b[i]) i++
  return i
}

export function buildTrace(input) {
  const { words } = input
  const m = words.length
  // pair[i] is the shared prefix of words i and i + 1.
  const pair = []
  for (let i = 0; i + 1 < m; i++) pair.push(lcp(words[i], words[i + 1]))
  const prefixMax = []
  let runMax = 0
  for (let i = 0; i < pair.length; i++) { runMax = Math.max(runMax, pair[i]); prefixMax.push(runMax) }
  const suffixMax = Array(pair.length).fill(0)
  runMax = 0
  for (let i = pair.length - 1; i >= 0; i--) { runMax = Math.max(runMax, pair[i]); suffixMax[i] = runMax }
  const answer = []
  const frames = [{ phase: 'start', activeLine: L('set pair[i] to the shared prefix'), removed: null, answer: [], message: 'Precompute the shared prefix of every neighbouring pair of words.' }]
  for (let r = 0; r < m; r++) {
    let best = 0
    if (r - 2 >= 0) best = Math.max(best, prefixMax[r - 2])
    if (r + 1 <= m - 2) best = Math.max(best, suffixMax[r + 1])
    if (r - 1 >= 0 && r + 1 <= m - 1) best = Math.max(best, lcp(words[r - 1], words[r + 1]))
    answer.push(best)
    frames.push({ phase: 'remove', activeLine: L('for each index r'), removed: r, answer: [...answer], message: `Remove index ${r}. The best adjacent prefix left is ${best}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), removed: null, answer, message: `Answers: ${answer.join(', ')}.` })
  return { input, result: answer, frames }
}

export const code = `longest common prefix after removals (words)
  let m be the length of words
  for each i from 0 to m minus 2, set pair[i] to the shared prefix of words[i] and words[i + 1]
  build prefixMax, the running maximum of pair from the left, and suffixMax from the right
  set answer to an empty list
  for each index r from 0 to m - 1
    set best to 0
    take prefixMax[r - 2] if that pair lies left of r, and suffixMax[r + 1] if pairs lie right of r
    if r has neighbours on both sides then take the shared prefix of words[r - 1] and words[r + 1]
    append best to answer
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_common_prefix_after_removals(words):
    def lcp(a, b):
        i = 0
        while i < len(a) and i < len(b) and a[i] == b[i]:
            i += 1
        return i

    m = len(words)
    pair = [lcp(words[i], words[i + 1]) for i in range(m - 1)]
    prefix_max = []
    run = 0
    for x in pair:
        run = max(run, x)
        prefix_max.append(run)
    suffix_max = [0] * len(pair)
    run = 0
    for i in range(len(pair) - 1, -1, -1):
        run = max(run, pair[i])
        suffix_max[i] = run
    answer = []
    for r in range(m):
        best = 0
        if r - 2 >= 0:
            best = max(best, prefix_max[r - 2])
        if r + 1 <= m - 2:
            best = max(best, suffix_max[r + 1])
        if r - 1 >= 0 and r + 1 <= m - 1:
            best = max(best, lcp(words[r - 1], words[r + 1]))
        answer.append(best)
    return answer
`
