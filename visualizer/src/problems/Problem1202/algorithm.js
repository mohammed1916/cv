// Independently authored union-find walkthrough. The strings and pairs are our own sample data.
const MAX_LENGTH = 40

export const code = [
  { line: 1, text: "function smallestStringWithSwaps(s, pairs) {" },
  { line: 2, text: "  const parent = Array.from({ length: s.length }, (_, i) => i)" },
  { line: 3, text: "  const find = x => {" },
  { line: 4, text: "    while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x] }" },
  { line: 5, text: "    return x" },
  { line: 6, text: "  }" },
  { line: 7, text: "  for (const [i, j] of pairs) {" },
  { line: 8, text: "    const ri = find(i)" },
  { line: 9, text: "    const rj = find(j)" },
  { line: 10, text: "    if (ri !== rj) parent[Math.max(ri, rj)] = Math.min(ri, rj)" },
  { line: 11, text: "  }" },
  { line: 12, text: "  const groups = new Map()" },
  { line: 13, text: "  for (let i = 0; i < s.length; i++) {" },
  { line: 14, text: "    const root = find(i)" },
  { line: 15, text: "    if (!groups.has(root)) groups.set(root, [])" },
  { line: 16, text: "    groups.get(root).push(i)" },
  { line: 17, text: "  }" },
  { line: 18, text: "  const out = [...s]" },
  { line: 19, text: "  for (const members of groups.values()) {" },
  { line: 20, text: "    const letters = members.map(i => s[i]).sort()" },
  { line: 21, text: "    members.forEach((position, k) => { out[position] = letters[k] })" },
  { line: 22, text: "  }" },
  { line: 23, text: "  return out.join('')" },
  { line: 24, text: "}" },
]

export const python = `def smallest_string_with_swaps(s, pairs):
    parent = list(range(len(s)))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    for i, j in pairs:
        ri, rj = find(i), find(j)
        if ri != rj:
            parent[max(ri, rj)] = min(ri, rj)
    groups = {}
    for i in range(len(s)):
        groups.setdefault(find(i), []).append(i)
    out = list(s)
    for members in groups.values():
        letters = sorted(s[i] for i in members)
        for i, c in zip(members, letters):
            out[i] = c
    return "".join(out)`

export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 7, 6: 7, 7: 8, 8: 9, 9: 9, 10: 10, 11: 12, 12: 12, 13: 13, 14: 14, 15: 14, 16: 14, 17: 14, 18: 15, 19: 16, 20: 17, 21: 19, 22: 19, 23: 20, 24: 20 }

export const phases = [
  { id: 'start', label: 'Separate', description: 'Every position begins as its own component.' },
  { id: 'inspect', label: 'Union pair', description: 'Join the components of the two positions in an allowed swap.' },
  { id: 'update', label: 'Sort component', description: 'Sort the letters in one component and place them at its sorted positions.' },
  { id: 'done', label: 'Result', description: 'Return the rebuilt string.' },
]

export const inputLabel = 'Object with s and pairs (JSON), e.g. {"s":"cba","pairs":[[0,1]]}'
export const complexity = 'Near O(n log n + p) with union-find, where n is the string length and p the number of pairs. The visualization accepts up to 40 letters and 40 pairs.'
export const examples = [
  { label: 'Two swap components reorder independently', input: '{"s":"forestpath","pairs":[[0,3],[3,6],[1,4],[4,7],[7,9],[2,5]]}' },
  { label: 'No allowed swaps', input: '{"s":"cedar","pairs":[]}' },
  { label: 'Every position joins one component', input: '{"s":"moss","pairs":[[0,1],[1,2],[2,3]]}' },
  { label: 'Repeated pair changes no component', input: '{"s":"oak","pairs":[[0,2],[0,2]]}' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || typeof input.s !== 'string' || !Array.isArray(input.pairs)) {
    throw new Error('Use an object with a string s and a pairs array, such as {"s":"cba","pairs":[[0,1]]}.')
  }
  const { s, pairs } = input
  if (!/^[a-z]{1,40}$/.test(s)) throw new Error('s must be 1 to 40 lowercase letters.')
  if (pairs.length > MAX_LENGTH) throw new Error('pairs can hold at most 40 entries.')
  for (const pair of pairs) {
    if (!Array.isArray(pair) || pair.length !== 2 || !pair.every(i => Number.isInteger(i) && i >= 0 && i < s.length)) {
      throw new Error(`Each pair must be two indices from 0 to ${s.length - 1}.`)
    }
  }
  return { s, pairs: pairs.map(([i, j]) => [i, j]) }
}

export function buildTrace({ s, pairs }) {
  const n = s.length
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = x => {
    while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x] }
    return x
  }
  const out = [...s]
  const frames = []
  const snap = (extra = {}) => ({ letters: [...s], parent: [...parent], result: out.join(''), ...extra })
  frames.push({ phase: 'start', activeLine: 2, message: `Each of the ${n} positions starts as its own component.`, snapshot: snap() })
  pairs.forEach(([i, j], pair) => {
    const ri = find(i)
    const rj = find(j)
    const merged = ri !== rj
    if (merged) parent[Math.max(ri, rj)] = Math.min(ri, rj)
    frames.push({
      phase: 'inspect', activeLine: 10,
      message: merged ? `Pair ${i} and ${j} joins components ${Math.min(ri, rj)} and ${Math.max(ri, rj)}.` : `Pair ${i} and ${j} is already connected, so nothing changes.`,
      snapshot: snap({ pair, merged }),
    })
  })
  const groups = new Map()
  for (let i = 0; i < n; i++) {
    const root = find(i)
    if (!groups.has(root)) groups.set(root, [])
    groups.get(root).push(i)
  }
  for (const members of groups.values()) {
    const letters = members.map(i => s[i]).sort()
    members.forEach((position, k) => { out[position] = letters[k] })
    frames.push({
      phase: 'update', activeLine: 21,
      message: `Positions ${members.join(', ')} receive ${letters.join('')} in increasing order.`,
      snapshot: snap({ group: [...members] }),
    })
  }
  const result = out.join('')
  frames.push({ phase: 'done', activeLine: 23, message: `Return ${result}.`, snapshot: snap() })
  return { input: { s, pairs }, result, frames }
}
