export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.parent) || typeof data.s !== 'string') throw new Error('Use an object such as {"parent":[-1,0,0,1],"s":"abac"}.')
  const { parent, s } = data
  const n = parent.length
  if (n < 1 || n > 12) throw new Error('parent has 1 to 12 entries.')
  if (parent[0] !== -1) throw new Error('parent[0] must be -1, because node 0 is the root.')
  for (let i = 1; i < n; i++) {
    if (!Number.isInteger(parent[i]) || parent[i] < 0 || parent[i] >= n || parent[i] === i) throw new Error(`parent[${i}] must name another node from 0 to ${n - 1}.`)
    let at = i
    for (let steps = 0; at !== 0; steps++) {
      if (steps > n) throw new Error('parent links must reach the root 0 without a cycle.')
      at = parent[at]
    }
  }
  if (s.length !== n || ![...s].every(c => c >= 'a' && c <= 'z')) throw new Error('s has one lowercase letter per node.')
  return { parent, s }
}

export function buildTrace({ parent, s }) {
  const n = parent.length
  const children = Array.from({ length: n }, () => [])
  for (let i = 1; i < n; i++) children[parent[i]].push(i)
  let best = 1
  const chains = {}
  const frames = [{ phase: 'start', activeLine: L('set best to 1'), node: null, chains: {}, best, message: 'Each node combines its two longest downward chains whose letters differ from its own.' }]
  const down = v => {
    let top1 = 0
    let top2 = 0
    for (const c of children[v]) {
      const length = down(c)
      if (s[c] === s[v]) continue
      if (length > top1) { top2 = top1; top1 = length } else if (length > top2) top2 = length
    }
    best = Math.max(best, 1 + top1 + top2)
    chains[v] = 1 + top1
    frames.push({ phase: 'visit', activeLine: L('set best to the larger'), node: v, chains: { ...chains }, best, message: `Node ${v} (${s[v]}) keeps a chain of ${1 + top1} and a best path of ${1 + top1 + top2} through it. Best so far: ${best}.` })
    return 1 + top1
  }
  down(0)
  frames.push({ phase: 'done', activeLine: L('return best'), node: null, chains: { ...chains }, best, message: `Longest path: ${best} nodes.` })
  return { input: { parent, s }, result: best, frames }
}

export const code = `longest path with different adjacent letters:
  build child lists from the parent array
  set best to 1
  call down on the root
  return best

down(v):
  set top1 and top2 to 0
  for each child c of v:
    length is down(c)
    if the letter of c equals the letter of v then skip c
    otherwise update top1 and top2 with length
  set best to the larger of best and 1 plus top1 plus top2
  return 1 plus top1`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_path_diff_adjacent(parent, s):
    n = len(parent)
    children = [[] for _ in range(n)]
    for i in range(1, n):
        children[parent[i]].append(i)
    best = 1
    def down(v):
        nonlocal best
        top1 = 0
        top2 = 0
        for c in children[v]:
            length = down(c)
            if s[c] == s[v]:
                continue
            if length > top1:
                top2 = top1
                top1 = length
            elif length > top2:
                top2 = length
        best = max(best, 1 + top1 + top2)
        return 1 + top1
    down(0)
    return best
`
