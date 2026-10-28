export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).join() !== 'words') throw new Error('Use a JSON object with one key: {"words": ["aa", "ab"]}.')
  const { words } = input
  if (!Array.isArray(words) || words.length < 1 || words.length > 8) throw new Error('words must be an array of 1 to 8 strings.')
  if (words.some(w => typeof w !== 'string' || !/^[a-z]{1,6}$/.test(w))) throw new Error('Each word is 1 to 6 lowercase letters.')
  return { words }
}

// A join removes one letter when the left word ends with the letter the right word starts with.
// Only the first letter, last letter and length of a string matter for later joins.
const put = (map, first, last, length) => {
  const key = first + last
  if (!map.has(key) || length < map.get(key).length) map.set(key, { first, last, length })
}

const summary = table => [...table.values()].map(({ first, last, length }) => ({ first, last, length }))

export function buildTrace(input) {
  const { words } = input
  let table = new Map()
  put(table, words[0][0], words[0].at(-1), words[0].length)
  const frames = [{ phase: 'start', activeLine: L('set the table to the first word'), index: 0, word: words[0], entries: summary(table), best: words[0].length, message: `Start with ${words[0]} alone, keyed by its first and last letters.` }]
  for (let i = 1; i < words.length; i++) {
    const w = words[i]
    const next = new Map()
    for (const { first, last, length } of table.values()) {
      put(next, first, w.at(-1), length + w.length - (last === w[0] ? 1 : 0))
      put(next, w[0], last, w.length + length - (w.at(-1) === first ? 1 : 0))
    }
    table = next
    const best = Math.min(...[...table.values()].map(e => e.length))
    frames.push({ phase: 'word', activeLine: L('for each later word'), index: i, word: w, entries: summary(table), best, message: `Join ${w} on either side of each stored string. Shortest so far: ${best}.` })
  }
  const result = Math.min(...[...table.values()].map(e => e.length))
  frames.push({ phase: 'done', activeLine: L('return the shortest length'), index: words.length - 1, word: '', entries: summary(table), best: result, message: `Shortest decremental concatenation has length ${result}.` })
  return { input: { words }, result, frames }
}

export const code = `Shortest decremental concatenation
a join removes one letter when the left word ends with the letter the right word starts with
set the table to the first word, keyed by its first and last letters, with its length
for each later word w
  set the next table to empty
  for each entry with first letter f, last letter l, and length L in the table
    join the table string with w on its right, and record it under f and the last letter of w
    join w with the table string on its right, and record it under the first letter of w and l
    keep only the shorter length for each key in the next table
  set the table to the next table
return the shortest length in the table`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def shortest_decremental_concatenation(words):
    table = {(words[0][0], words[0][-1]): len(words[0])}
    for w in words[1:]:
        nxt = {}
        for (first, last), length in table.items():
            options = [
                ((first, w[-1]), length + len(w) - (1 if last == w[0] else 0)),
                ((w[0], last), len(w) + length - (1 if w[-1] == first else 0)),
            ]
            for key, cand in options:
                if key not in nxt or cand < nxt[key]:
                    nxt[key] = cand
        table = nxt
    return min(table.values())
`
