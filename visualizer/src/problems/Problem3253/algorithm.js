export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with target, words and costs.')
  const { target, words, costs } = input
  if (typeof target !== 'string' || target.length < 1 || target.length > 30 || !/^[a-z]+$/.test(target)) throw new Error('target has 1 to 30 lowercase letters.')
  if (!Array.isArray(words) || words.length < 1 || words.length > 8) throw new Error('words lists 1 to 8 words.')
  if (!words.every(w => typeof w === 'string' && w.length >= 1 && w.length <= 8 && /^[a-z]+$/.test(w))) throw new Error('Each word has 1 to 8 lowercase letters.')
  if (!Array.isArray(costs) || costs.length !== words.length) throw new Error('costs has one entry per word.')
  if (!costs.every(c => Number.isInteger(c) && c >= 0 && c <= 1000)) throw new Error('Each cost is an integer from 0 to 1000.')
  return { target, words, costs }
}

export const code = `FUNCTION minimumCost(target, words, costs)
    m ← length of target
    best ← array of m + 1 entries, all infinity
    best[0] ← 0
    FOR i from 0 to m − 1
        IF best[i] is infinity THEN skip to the next i
        FOR each word k
            IF words[k] matches target starting at i THEN
                best[i + length of words[k]] ← smaller of its current value and best[i] + costs[k]
    IF best[m] is infinity THEN RETURN -1
    RETURN best[m]`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def minimum_cost(target, words, costs):
    m = len(target)
    INF = float("inf")
    best = [INF] * (m + 1)
    best[0] = 0
    for i in range(m):
        if best[i] == INF:
            continue
        for word, cost in zip(words, costs):
            if target.startswith(word, i):
                j = i + len(word)
                best[j] = min(best[j], best[i] + cost)
    return -1 if best[m] == INF else best[m]


if __name__ == "__main__":
    import json
    import sys
    data = json.loads(sys.stdin.read())
    print(minimum_cost(data["target"], data["words"], data["costs"]))
`

const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function buildTrace({ target, words, costs }) {
  const m = target.length
  const best = Array(m + 1).fill(Infinity)
  best[0] = 0
  const frames = []
  const snap = () => best.slice()
  frames.push({
    phase: 'start', activeLine: L('best[0] ← 0'), pythonLine: P('best[0] = 0'),
    i: -1, k: -1, matched: null, candidate: null, updated: null, best: snap(),
    message: 'best[0] = 0: building the empty prefix costs nothing. Every other prefix starts unreachable.',
  })
  for (let i = 0; i < m; i++) {
    if (best[i] === Infinity) {
      frames.push({
        phase: 'skip', activeLine: L('IF best[i] is infinity'), pythonLine: P('if best[i] == INF'),
        i, k: -1, matched: null, candidate: null, updated: null, best: snap(),
        message: `Prefix length ${i} is unreachable, so no word can start here.`,
      })
      continue
    }
    frames.push({
      phase: 'position', activeLine: L('FOR i from 0'), pythonLine: P('for i in range(m)'),
      i, k: -1, matched: null, candidate: null, updated: null, best: snap(),
      message: `Extend the cheapest way to build the first ${i} letters (cost ${best[i]}) with a word that starts at position ${i}.`,
    })
    words.forEach((word, k) => {
      const matched = target.startsWith(word, i)
      frames.push({
        phase: 'check', activeLine: L('IF words[k] matches'), pythonLine: P('if target.startswith(word, i)'),
        i, k, matched, candidate: matched ? best[i] + costs[k] : null, updated: null, best: snap(),
        message: matched
          ? `"${word}" matches at ${i}; the candidate cost is ${best[i]} + ${costs[k]}.`
          : `"${word}" does not match target at ${i}.`,
      })
      if (!matched) return
      const j = i + word.length
      const candidate = best[i] + costs[k]
      if (candidate < best[j]) {
        best[j] = candidate
        frames.push({
          phase: 'update', activeLine: L('best[i + length of words[k]]'), pythonLine: P('best[j] = min(best[j], best[i] + cost)'),
          i, k, matched, candidate, updated: j, best: snap(),
          message: `best[${j}] becomes ${candidate}.`,
        })
      }
    })
  }
  const result = best[m] === Infinity ? -1 : best[m]
  frames.push({
    phase: 'done', activeLine: L(result === -1 ? 'RETURN -1' : 'RETURN best[m]'),
    pythonLine: P('return -1 if best[m] == INF'),
    i: m, k: -1, matched: null, candidate: null, updated: null, best: snap(),
    message: result === -1 ? 'The full target cannot be built from these words.' : `The minimum cost for the whole target is ${result}.`,
  })
  return { input: { target, words, costs }, result, frames }
}
