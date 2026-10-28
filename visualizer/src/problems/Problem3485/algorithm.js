export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || typeof input !== 'object') throw new Error('Use an object with words and k.')
  const { words, k } = input
  if (!Array.isArray(words) || words.length < 2 || words.length > 8) throw new Error('words needs 2 to 8 entries.')
  if (words.some(w => typeof w !== 'string' || w.length < 1 || w.length > 5 || !/^[a-z]+$/.test(w))) {
    throw new Error('Each word is 1 to 5 lowercase letters.')
  }
  if (!Number.isInteger(k) || k < 1 || k > words.length - 1) throw new Error('k is an integer from 1 to words.length minus 1.')
  return { words, k }
}

const prefixesOf = word => Array.from({ length: word.length }, (_, i) => word.slice(0, i + 1))

export function buildTrace(input) {
  const { words, k } = input
  const counts = new Map()
  for (const w of words) for (const p of prefixesOf(w)) counts.set(p, (counts.get(p) ?? 0) + 1)
  const answer = []
  const frames = [{ phase: 'start', activeLine: L('count how many words'), removed: -1, best: 0, answer: [], message: `Count how many words start with each prefix; k is ${k}.` }]
  words.forEach((w, i) => {
    const ps = prefixesOf(w)
    for (const p of ps) counts.set(p, counts.get(p) - 1)
    frames.push({ phase: 'remove', activeLine: L('take one word out'), removed: i, best: 0, answer: answer.slice(), message: `Remove "${w}" at ${i}; its prefixes lose one word each.` })
    let best = 0
    for (const [p, c] of counts) if (c >= k && p.length > best) best = p.length
    answer.push(best)
    for (const p of ps) counts.set(p, counts.get(p) + 1)
    frames.push({ phase: 'record', activeLine: L('add best to answer'), removed: i, best, answer: answer.slice(), message: `Without "${w}", the longest prefix shared by ${k} words has length ${best}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return answer'), removed: -1, best: 0, answer: answer.slice(), message: `Answer: [${answer.join(', ')}].` })
  return { input, result: answer, frames }
}

export const code = `longest common prefix of k words after each removal:
  count how many words start with each prefix of each word
  set answer to an empty list
  for each index i
    take one word out by subtracting 1 from each of its prefix counts
    set best to the longest prefix whose count is at least k
    add best to answer
    put the word back by adding 1 to each of its prefix counts
  return answer`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_prefix_after_removal(words, k):
    def prefixes(word):
        return [word[:i] for i in range(1, len(word) + 1)]

    counts = {}
    for w in words:
        for p in prefixes(w):
            counts[p] = counts.get(p, 0) + 1
    answer = []
    for w in words:
        ps = prefixes(w)
        for p in ps:
            counts[p] -= 1
        best = 0
        for p, c in counts.items():
            if c >= k and len(p) > best:
                best = len(p)
        answer.append(best)
        for p in ps:
            counts[p] += 1
    return answer
`
