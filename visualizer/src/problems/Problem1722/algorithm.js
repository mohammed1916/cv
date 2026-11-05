// Minimise Hamming distance: positions joined by allowed swaps can be rearranged freely inside their group.
const JS_LINES = [
  { text: 'const parent = Array.from({ length: n }, (_, i) => i)', py: 'parent = list(range(n))' },
  { text: 'const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])))', py: 'def find' },
  { text: 'for (const [a, b] of allowedSwaps) parent[find(a)] = find(b)', py: 'for a, b in allowed_swaps' },
  { text: 'const groups = groupBy(i => find(i))', py: 'groups = {}' },
  { text: 'let distance = 0', py: 'distance = 0' },
  { text: 'for (const members of groups.values()) {', py: 'for members in groups.values()' },
  { text: 'const pool = countOf(source, members)', py: 'pool = Counter' },
  { text: 'let matched = 0', py: 'matched = 0' },
  { text: 'for (const i of members) if (take(pool, target[i])) matched++', py: 'for i in members' },
  { text: 'distance += members.length - matched', py: 'distance += len' },
  { text: '}', py: null },
  { text: 'return distance', py: 'return distance' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `from collections import Counter

def minimumHammingDistance(source, target, allowed_swaps):
    n = len(source)
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    for a, b in allowed_swaps:
        parent[find(a)] = find(b)
    groups = {}
    for i in range(n):
        groups.setdefault(find(i), []).append(i)
    distance = 0
    for members in groups.values():
        pool = Counter(source[i] for i in members)
        matched = 0
        for i in members:
            if pool[target[i]] > 0:
                pool[target[i]] -= 1
                matched += 1
        distance += len(members) - matched
    return distance
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return distance')]))

export const phases = [
  { id: 'join', label: 'Join', description: 'Positions linked by an allowed swap form one group.' },
  { id: 'group', label: 'Group', description: 'Inside a group, the source values can be placed in any position.' },
  { id: 'match', label: 'Match', description: 'Each target value that the group still holds is matched and costs nothing.' },
  { id: 'done', label: 'Result', description: 'Every unmatched position in a group adds one to the Hamming distance.' },
]

export const examples = [
  { label: 'Two groups', input: '{"source":[5,1,2,4,3],"target":[1,5,4,2,3],"allowedSwaps":[[0,1],[1,2],[3,4]]}' },
  { label: 'No swaps', input: '{"source":[1,2],"target":[2,1],"allowedSwaps":[]}' },
]

export const complexity = 'O(n + s * alpha(n)) time for n positions and s swaps, plus the counting inside each group. Space is O(n).'

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.source) || !Array.isArray(input.target) || !Array.isArray(input.allowedSwaps)) throw new Error('Use an object with source, target and allowedSwaps.')
  const { source, target, allowedSwaps } = input
  if (source.length !== target.length || source.length < 1 || source.length > 12) throw new Error('source and target have the same length, 1 to 12 (visual cap).')
  if (!source.every(v => Number.isInteger(v) && v >= 1 && v <= 9) || !target.every(v => Number.isInteger(v) && v >= 1 && v <= 9)) throw new Error('Values are integers from 1 to 9.')
  for (const [a, b] of allowedSwaps) {
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0 || a >= source.length || b >= source.length || a === b) throw new Error('Each allowed swap is a pair of different valid positions.')
  }
  return { source, target, allowedSwaps }
}

export function buildTrace({ source, target, allowedSwaps }) {
  const n = source.length
  const frames = []
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  for (const [a, b] of allowedSwaps) parent[find(a)] = find(b)
  const groupsMap = new Map()
  for (let i = 0; i < n; i++) {
    const r = find(i)
    if (!groupsMap.has(r)) groupsMap.set(r, [])
    groupsMap.get(r).push(i)
  }
  const groups = [...groupsMap.values()]
  frames.push({ phase: 'join', activeLine: 3, groups, group: -1, message: `${groups.length} group${groups.length === 1 ? '' : 's'} after the allowed swaps.`, snapshot: { distance: 0 } })
  let distance = 0
  groups.forEach((members, g) => {
    const pool = new Map()
    for (const i of members) pool.set(source[i], (pool.get(source[i]) ?? 0) + 1)
    frames.push({ phase: 'group', activeLine: 7, groups, group: g, members, message: `Group [${members.join(', ')}] holds sources [${members.map(i => source[i]).join(', ')}].`, snapshot: { distance } })
    let matched = 0
    for (const i of members) {
      const c = pool.get(target[i]) ?? 0
      if (c > 0) {
        matched++
        pool.set(target[i], c - 1)
        frames.push({ phase: 'match', activeLine: 9, groups, group: g, members, position: i, message: `Position ${i} wants ${target[i]}, which the group can supply.`, snapshot: { distance } })
      } else {
        frames.push({ phase: 'match', activeLine: 9, groups, group: g, members, position: i, message: `Position ${i} wants ${target[i]}, which is not left: one mismatch.`, snapshot: { distance } })
      }
    }
    distance += members.length - matched
  })
  frames.push({ phase: 'done', activeLine: 12, groups, group: -1, result: distance, message: `Minimum Hamming distance ${distance}.`, snapshot: { distance } })
  return { input: { source, target, allowedSwaps }, n, result: distance, groups, frames }
}
