// LeetCode 2157: Groups of Strings.
// Represent each word as a 26-bit letter mask. Two words are connected when one mask is reached from the
// other by adding a letter, removing a letter, or replacing one letter. Union-find joins the connected words;
// the answer is the number of groups and the size of the largest one.

export function parseInput(text) {
  let words
  try { words = JSON.parse(text) } catch { throw new Error('Use a JSON array of words, e.g. ["a","b","ab"].') }
  if (!Array.isArray(words) || words.length < 1 || words.length > 12) throw new Error('Use 1 to 12 words.')
  for (const word of words) {
    if (typeof word !== 'string' || !/^[a-z]{1,8}$/.test(word) || new Set(word).size !== word.length) {
      throw new Error('Each word has 1 to 8 lowercase letters, with no letter repeated.')
    }
  }
  return { words }
}

export const code = `function groupStrings(words) {
  const maskOf = word => {
    let mask = 0
    for (const ch of word) mask |= 1 << (ch.charCodeAt(0) - 97)
    return mask
  }
  const masks = words.map(maskOf)
  const index = new Map()
  masks.forEach((mask, i) => {
    if (!index.has(mask)) index.set(mask, i)
  })
  const parent = words.map((_, i) => i)
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  const union = (a, b) => { parent[find(a)] = find(b) }
  for (const [mask, i] of index) {
    for (let bit = 0; bit < 26; bit++) {
      const b = 1 << bit
      const neighbours = []
      if (mask & b) {
        neighbours.push(mask ^ b)
        for (let other = 0; other < 26; other++) {
          if (!(mask & (1 << other))) neighbours.push((mask ^ b) | (1 << other))
        }
      } else {
        neighbours.push(mask | b)
      }
      for (const next of neighbours) if (index.has(next)) union(index.get(mask), index.get(next))
    }
  }
  const sizes = new Map()
  for (let i = 0; i < words.length; i++) {
    const root = find(index.get(masks[i]))
    sizes.set(root, (sizes.get(root) ?? 0) + 1)
  }
  return [sizes.size, Math.max(...sizes.values())]
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: group_strings
def group_strings(words):
    def mask_of(word):
        mask = 0
        for ch in word:
            mask |= 1 << (ord(ch) - 97)
        return mask
    masks = [mask_of(w) for w in words]
    index = {}
    for i, mask in enumerate(masks):
        index.setdefault(mask, i)
    parent = {i: i for i in index.values()}
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    def union(a, b):
        parent[find(a)] = find(b)
    for mask, i in index.items():
        for bit in range(26):
            b = 1 << bit
            if mask & b:
                neighbours = [mask ^ b]
                for other in range(26):
                    if not (mask & (1 << other)):
                        neighbours.append((mask ^ b) | (1 << other))
            else:
                neighbours = [mask | b]
            for nxt in neighbours:
                if nxt in index:
                    union(index[mask], index[nxt])
    sizes = {}
    for i in index.values():
        root = find(i)
        sizes[root] = sizes.get(root, 0) + 1
    return [len(sizes), max(sizes.values())]
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'masks', label: 'Letter sets', description: 'Each word becomes the set of its letters.' },
  { id: 'link', label: 'Link neighbours', description: 'Words one add, remove or replace away are joined in the same group.' },
  { id: 'done', label: 'Groups', description: 'The number of groups and the largest group size.' },
]

const letters = mask => [...Array(26)].map((_, b) => (mask & (1 << b) ? String.fromCharCode(97 + b) : '')).join('')

export function buildTrace({ words }) {
  const frames = []
  const masks = words.map(word => [...word].reduce((m, ch) => m | (1 << (ch.charCodeAt(0) - 97)), 0))
  const index = new Map()
  masks.forEach((mask, i) => { if (!index.has(mask)) index.set(mask, i) })
  const parent = words.map((_, i) => i)
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  const union = (a, b) => { parent[find(a)] = find(b) }
  const groupOf = () => words.map((_, i) => find(index.get(masks[i])))
  frames.push({ phase: 'masks', activeLine: L('const masks = words.map'), pythonLine: P('masks = ['), message: `${index.size} distinct letter sets from ${words.length} words.`, rows: words.map((w, i) => ({ word: w, letters: letters(masks[i]), group: '–' })) })
  for (const [mask, i] of index) {
    for (let bit = 0; bit < 26; bit++) {
      const b = 1 << bit
      const neighbours = []
      if (mask & b) {
        neighbours.push(mask ^ b)
        for (let other = 0; other < 26; other++) if (!(mask & (1 << other))) neighbours.push((mask ^ b) | (1 << other))
      } else {
        neighbours.push(mask | b)
      }
      for (const next of neighbours) {
        if (index.has(next) && find(index.get(next)) !== find(i)) {
          union(i, index.get(next))
          const groups = groupOf()
          frames.push({ phase: 'link', activeLine: L('for (const next of neighbours)'), pythonLine: P('for nxt in neighbours'), message: `${letters(mask) || 'empty'} and ${letters(next) || 'empty'} are one edit apart: joined.`, rows: words.map((w, k) => ({ word: w, letters: letters(masks[k]), group: groups[k] })) })
        }
      }
    }
  }
  const groups = groupOf()
  const sizes = {}
  for (const g of groups) sizes[g] = (sizes[g] ?? 0) + 1
  const result = [Object.keys(sizes).length, Math.max(...Object.values(sizes))]
  frames.push({ phase: 'done', activeLine: L('return ['), pythonLine: P('return [len'), message: `${result[0]} groups; the largest has ${result[1]} words.`, rows: words.map((w, k) => ({ word: w, letters: letters(masks[k]), group: groups[k] })) })
  return { input: { words }, result, frames }
}
