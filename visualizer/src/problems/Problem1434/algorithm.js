const MOD = 1000000007

export function parseInput(text) {
  const data = JSON.parse(text)
  const hats = data?.hats
  if (!Array.isArray(hats) || hats.length < 1 || hats.length > 5) throw new Error('hats must list 1 to 5 people.')
  for (const options of hats) {
    if (!Array.isArray(options) || options.length < 1 || options.length > 5) throw new Error('Each person lists 1 to 5 hats.')
    if (options.some(h => !Number.isInteger(h) || h < 1 || h > 40)) throw new Error('Hat numbers are integers from 1 to 40.')
    if (new Set(options).size !== options.length) throw new Error('A person lists each hat at most once.')
  }
  return { hats }
}

export const code = `ways to wear different hats(hats)
  set ways[mask] to 1 when mask is empty, else 0
  for each hat from 1 to 40 that someone likes
    copy ways to next
    for each mask with ways[mask] above 0
      for each person i not in mask who likes this hat
        add ways[mask] to next[mask with i added]
    replace ways with next
  return ways[everyone]`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// A mask records which people already have a hat. Hats are processed one at a time, so each hat is used at most once.
export function buildTrace({ hats }) {
  const n = hats.length
  const full = (1 << n) - 1
  const likes = new Map()
  hats.forEach((options, person) => options.forEach(hat => {
    if (!likes.has(hat)) likes.set(hat, [])
    likes.get(hat).push(person)
  }))
  let ways = Array(1 << n).fill(0)
  ways[0] = 1
  const frames = [{ phase: 'start', hat: null, dp: [...ways], activeLine: L('set ways[mask] to 1'), message: 'No one has a hat yet. The empty set of people has exactly one assignment.' }]
  const hatsInUse = [...likes.keys()].sort((a, b) => a - b)
  for (const hat of hatsInUse) {
    const people = likes.get(hat)
    const next = [...ways]
    for (let mask = 0; mask <= full; mask++) {
      if (ways[mask] === 0) continue
      for (const person of people) {
        if (mask & (1 << person)) continue
        const target = mask | (1 << person)
        next[target] = (next[target] + ways[mask]) % MOD
      }
    }
    ways = next
    frames.push({ phase: 'hat', hat, dp: [...ways], activeLine: L('add ways[mask] to next'), message: `Hat ${hat}: people ${people.map(p => p + 1).join(', ')} may take it. Assignments now cover more people.` })
  }
  const result = ways[full]
  frames.push({ phase: 'done', hat: null, dp: [...ways], activeLine: L('return ways[everyone]'), result, message: `Ways for everyone to wear a different hat: ${result}.` })
  return { input: { hats }, result, frames }
}

export const python = `def number_of_ways(hats):
    MOD = 1000000007
    n = len(hats)
    likes = {}
    for person, options in enumerate(hats):
        for hat in options:
            likes.setdefault(hat, []).append(person)
    ways = [0] * (1 << n)
    ways[0] = 1
    for hat in sorted(likes):
        nxt = ways[:]
        for mask in range(1 << n):
            if ways[mask] == 0:
                continue
            for person in likes[hat]:
                if not mask & (1 << person):
                    target = mask | (1 << person)
                    nxt[target] = (nxt[target] + ways[mask]) % MOD
        ways = nxt
    return ways[(1 << n) - 1]
`
