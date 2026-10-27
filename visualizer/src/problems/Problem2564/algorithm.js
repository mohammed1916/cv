export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with s and queries.')
  const { s, queries } = data
  if (typeof s !== 'string' || s.length < 1 || s.length > 40 || !/^[01]+$/.test(s)) throw new Error('s is a binary string of 1 to 40 characters.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > 8) throw new Error('queries lists 1 to 8 pairs [first, second].')
  for (const query of queries) {
    if (!Array.isArray(query) || query.length !== 2 || !query.every(v => Number.isInteger(v) && v >= 0 && v <= 1000)) throw new Error('Each query is a pair of integers from 0 to 1000.')
  }
  return { s, queries }
}

export function buildTrace(input) {
  const { s, queries } = input
  const n = s.length
  const frames = []
  const best = new Map()
  const frame = (phase, line, extra, message) => frames.push({ phase, activeLine: line, window: null, value: null, recorded: false, query: null, answers: [], message, ...extra })
  frame('start', L('set best to an empty table'), {}, 'Build a table from every substring value to its shortest, leftmost location.')
  for (let i = 0; i < n; i++) {
    for (let j = i; j < Math.min(n, i + 30); j++) {
      if (s[i] === '0' && j > i) break
      const value = parseInt(s.slice(i, j + 1), 2)
      const current = best.get(value)
      const recorded = !current || (j - i) < (current.r - current.l) || ((j - i) === (current.r - current.l) && i < current.l)
      if (recorded) best.set(value, { l: i, r: j })
      frame('record', L('record i and j'), { window: [i, j], value, recorded },
        `Substring ${s.slice(i, j + 1)} is ${value}. ${recorded ? 'It becomes the stored location for this value.' : 'A stored location already wins.'}`)
    }
  }
  const answers = []
  queries.forEach(([first, second], index) => {
    const target = first ^ second
    frame('target', L('set target to'), { query: index, value: target, answers: [...answers] },
      `Query ${index + 1}: ${first} xor ${second} is ${target}.`)
    const stored = best.get(target)
    const pair = stored ? [stored.l, stored.r] : [-1, -1]
    answers.push(pair)
    frame('answer', L('if target is in best'), { query: index, value: target, window: stored ? pair : null, answers: [...answers] },
      stored ? `Substring from ${pair[0]} to ${pair[1]} gives ${target}.` : `No substring gives ${target}, so the answer is [-1, -1].`)
  })
  frame('done', L('return answers'), { answers: [...answers] }, 'All queries are answered.')
  return { input, result: answers, frames }
}

export const code = `substring xor queries, answered from the shortest substrings
  set best to an empty table keyed by value
  for each start i from 0 to the last index, do
    for each end j from i up to i plus 29 inside the string, do
      stop this start when s at i is 0 and j is past i
      set value to the binary value of s from i to j
      record i and j for value when shorter, or same length and earlier
  for each query (first, second), do
    set target to first xor second
    if target is in best then answer with its stored pair
    otherwise answer [-1, -1]
  return answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def substring_xor_queries(s, queries):
    best = {}
    n = len(s)
    for i in range(n):
        for j in range(i, min(n, i + 30)):
            if s[i] == '0' and j > i:
                break
            value = int(s[i:j + 1], 2)
            cur = best.get(value)
            if cur is None or (j - i, i) < (cur[1] - cur[0], cur[0]):
                best[value] = (i, j)
    answer = []
    for first, second in queries:
        target = first ^ second
        if target in best:
            l, r = best[target]
            answer.append([l, r])
        else:
            answer.append([-1, -1])
    return answer
`
