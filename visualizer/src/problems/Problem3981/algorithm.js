const MOD = 1000000007

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data.word1 !== 'string' || typeof data.word2 !== 'string' || typeof data.target !== 'string') {
    throw new Error('Use {"word1": "...", "word2": "...", "target": "..."}.')
  }
  const { word1, word2, target } = data
  for (const [name, w] of [['word1', word1], ['word2', word2], ['target', target]]) {
    if (w.length < 1 || w.length > 6) throw new Error(`${name} must have 1 to 6 characters for the visualization.`)
    if (!/^[a-z]+$/.test(w)) throw new Error(`${name} uses lowercase letters only.`)
  }
  return { word1, word2, target }
}

export function buildTrace(input) {
  const { word1, word2, target } = input
  const n1 = word1.length
  const n2 = word2.length
  let states = new Map([['0,0', 1]])
  const frames = [{ phase: 'start', activeLine: L('let states be'), p: -1, ways: 1, message: 'No target characters matched yet; one way with nothing used.' }]
  for (let p = 0; p < target.length; p++) {
    const ch = target[p]
    const next = new Map()
    const add = (key, c) => next.set(key, ((next.get(key) ?? 0) + c) % MOD)
    for (const [key, c] of states) {
      const [i, j] = key.split(',').map(Number)
      for (let x = i; x < n1; x++) if (word1[x] === ch) add(`${x + 1},${j}`, c)
      for (let y = j; y < n2; y++) if (word2[y] === ch) add(`${i},${y + 1}`, c)
    }
    states = next
    let total = 0
    for (const c of states.values()) total = (total + c) % MOD
    frames.push({ phase: 'char', activeLine: L('for each character ch'), p, ways: total, message: `Target character ${p + 1} is "${ch}". ${states.size} state(s) remain.` })
  }
  let result = 0
  for (const [key, c] of states) {
    const [i, j] = key.split(',').map(Number)
    if (i > 0 && j > 0) result = (result + c) % MOD
  }
  frames.push({ phase: 'done', activeLine: L('return the total'), p: target.length, ways: result, message: `Distinct ways using both words: ${result}.` })
  return { input, result, frames }
}

export const code = `count distinct ways to build target from word1 and word2
  let states be a table from (next free index in word1, next free index in word2) to ways, starting at (0, 0) with 1
  for each character ch of target in order
    let next be an empty table
    for each state (i, j) with ways c
      for each index x from i to the end of word1
        if word1[x] equals ch then add c to next at (x + 1, j)
      for each index y from j to the end of word2
        if word2[y] equals ch then add c to next at (i, y + 1)
    set states to next
  return the total of ways in states where both words were used`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_distinct_ways(word1, word2, target):
    MOD = 10 ** 9 + 7
    n1, n2 = len(word1), len(word2)
    states = {(0, 0): 1}
    for ch in target:
        nxt = {}
        for (i, j), c in states.items():
            for x in range(i, n1):
                if word1[x] == ch:
                    nxt[(x + 1, j)] = (nxt.get((x + 1, j), 0) + c) % MOD
            for y in range(j, n2):
                if word2[y] == ch:
                    nxt[(i, y + 1)] = (nxt.get((i, y + 1), 0) + c) % MOD
        states = nxt
    return sum(c for (i, j), c in states.items() if i > 0 and j > 0) % MOD
`
