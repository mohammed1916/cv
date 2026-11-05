export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Array.isArray(input?.nums) || input.nums.length < 1 || input.nums.length > 8) throw new Error('nums has 1 to 8 integers.')
  if (!input.nums.every(v => Number.isInteger(v) && v >= 1 && v <= 100)) throw new Error('Each value is an integer from 1 to 100.')
  return { nums: input.nums }
}

export const code = `function canTraverseAll(nums)
  if there is one number, RETURN true
  owner <- empty map from prime to the first index that has it
  parent[i] <- i for every index i
  for each index i
    if nums[i] is 1, RETURN false (1 shares no prime with anything)
    for each prime p dividing nums[i]
      if owner has p, union i with owner[p]
      else owner[p] <- i
  RETURN every index has the same root as index 0`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def can_traverse_all(nums):
    if len(nums) == 1:
        return True
    parent = list(range(len(nums)))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    owner = {}
    for i, value in enumerate(nums):
        if value == 1:
            return False
        p, rest = 2, value
        while p * p <= rest:
            if rest % p == 0:
                while rest % p == 0:
                    rest //= p
                if p in owner:
                    parent[find(i)] = find(owner[p])
                else:
                    owner[p] = i
            p += 1
        if rest > 1:
            if rest in owner:
                parent[find(i)] = find(owner[rest])
            else:
                owner[rest] = i
    return all(find(i) == find(0) for i in range(len(nums)))
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

const primesOf = value => {
  const out = []
  let rest = value
  for (let p = 2; p * p <= rest; p++) {
    if (rest % p === 0) { out.push(p); while (rest % p === 0) rest /= p }
  }
  if (rest > 1) out.push(rest)
  return out
}

export function buildTrace({ nums }) {
  const n = nums.length
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = x => { while (parent[x] !== x) x = parent[x]; return x }
  const owner = new Map()
  const edges = []
  const frames = []
  const roots = () => Object.fromEntries(Array.from({ length: n }, (_, v) => [v, `group ${find(v)}`]))
  const snap = fields => frames.push({ nums, n, edges: [...edges], tags: roots(), current: null, neighbour: null, prime: null, result: null, ...fields })
  snap({ phase: 'setup', activeLine: CL('owner <- empty map'), pythonLine: PL('owner = {}'), message: 'Every index starts alone; each prime remembers its first index.' })
  if (n === 1) {
    snap({ phase: 'done', activeLine: CL('RETURN true'), pythonLine: PL('return True'), message: 'One number can always be traversed.', result: true })
    return { input: { nums }, result: true, frames }
  }
  let result = null
  for (let i = 0; i < n && result === null; i++) {
    if (nums[i] === 1) {
      snap({ phase: 'one', activeLine: CL('nums[i] is 1'), pythonLine: PL('if value == 1'), current: i, message: `Index ${i} holds 1, which shares no prime with another number. Answer false.` })
      result = false
      break
    }
    for (const p of primesOf(nums[i])) {
      if (owner.has(p)) {
        const j = owner.get(p)
        edges.push([i, j])
        parent[find(i)] = find(j)
        snap({ phase: 'union', activeLine: CL('union i with owner'), pythonLine: PL('parent[find(i)] = find(owner[p])'), current: i, neighbour: j, prime: p, message: `${nums[i]} and ${nums[j]} share prime ${p}, so indices ${i} and ${j} join.` })
      } else {
        owner.set(p, i)
        snap({ phase: 'own', activeLine: CL('owner[p] <- i'), pythonLine: PL('owner[p] = i'), current: i, prime: p, message: `Prime ${p} is claimed by index ${i}.` })
      }
    }
  }
  if (result === null) {
    result = Array.from({ length: n }, (_, i) => find(i) === find(0)).every(Boolean)
    snap({ phase: 'done', activeLine: CL('RETURN every index'), pythonLine: PL('return all('), current: null, message: result ? 'Every index is in the group of index 0, so all pairs can be traversed.' : 'Some index is in a different group, so traversal is impossible.', result })
  } else {
    snap({ phase: 'done', activeLine: CL('RETURN false'), pythonLine: PL('return False'), current: null, message: 'Answer false.', result })
  }
  return { input: { nums }, result, frames }
}
