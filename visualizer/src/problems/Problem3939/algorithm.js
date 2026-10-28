const MOD = 1000000007

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.parent) || !Array.isArray(data.nums) || !Number.isInteger(data.k)) {
    throw new Error('Use {"parent": [...], "nums": [...], "k": k}.')
  }
  const { parent, nums, k } = data
  const n = parent.length
  if (n < 1 || n > 8) throw new Error('The tree must have 1 to 8 nodes for the visualization.')
  if (nums.length !== n) throw new Error('nums must have one value per node.')
  if (parent[0] !== -1) throw new Error('Node 0 is the root, so parent[0] must be -1.')
  for (let i = 1; i < n; i++) if (!Number.isInteger(parent[i]) || parent[i] < 0 || parent[i] >= i) throw new Error('Each parent index must be smaller than its child index.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 9)) throw new Error('Node values are integers from 1 to 9.')
  if (!Number.isInteger(k) || k < 1 || k > 9) throw new Error('k is an integer from 1 to 9.')
  return { parent, nums, k }
}

export function buildTrace(input) {
  const { parent, nums, k } = input
  const n = parent.length
  const children = Array.from({ length: n }, () => [])
  for (let i = 1; i < n; i++) children[parent[i]].push(i)
  const notPicked = Array(n)
  const picked = Array(n)
  const frames = [{ phase: 'start', activeLine: L('let total be'), node: null, sums: [], result: null, message: `Process nodes from the last index down to the root. Remainders are taken mod ${k}.` }]
  for (let v = n - 1; v >= 0; v--) {
    let a = Array(k).fill(0)
    a[0] = 1
    let b = Array(k).fill(0)
    b[nums[v] % k] = 1
    for (const c of children[v]) {
      const anyChild = notPicked[c].map((x, r) => (x + picked[c][r]) % MOD)
      const na = Array(k).fill(0)
      const nb = Array(k).fill(0)
      for (let r1 = 0; r1 < k; r1++) for (let r2 = 0; r2 < k; r2++) {
        const r = (r1 + r2) % k
        na[r] = (na[r] + a[r1] * anyChild[r2]) % MOD
        nb[r] = (nb[r] + b[r1] * notPicked[c][r2]) % MOD
      }
      a = na
      b = nb
    }
    notPicked[v] = a
    picked[v] = b
    frames.push({ phase: 'node', activeLine: L('for each node v from'), node: v, sums: [...a], result: null, message: `Node ${v} (value ${nums[v]}): ${a[0]} subset(s) without it and ${b[0]} with it reach remainder 0 in its subtree.` })
  }
  const result = (notPicked[0][0] + picked[0][0] - 1 + MOD) % MOD
  frames.push({ phase: 'done', activeLine: L('return total'), node: null, sums: [], result, message: `Valid non-empty subsets: ${result}.` })
  return { input, result, frames }
}

export const code = `count valid subsets of the rooted tree
  let total be 0 as the number of valid subsets, with sums taken mod k
  for each node v from the last index down to 0
    let notPicked be a table of remainders, starting with the empty set at remainder 0
    let picked be a table of remainders, starting with v alone
    for each child c of v
      combine picked with notPicked of c, and notPicked with every subset of c
    store notPicked and picked for v
  let total be the root remainder-0 count of both tables minus the empty set
  return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_non_adjacent_subsets(parent, nums, k):
    MOD = 10 ** 9 + 7
    n = len(parent)
    children = [[] for _ in range(n)]
    for i in range(1, n):
        children[parent[i]].append(i)
    not_picked = [None] * n
    picked = [None] * n
    for v in range(n - 1, -1, -1):
        a = [0] * k
        a[0] = 1
        b = [0] * k
        b[nums[v] % k] = 1
        for c in children[v]:
            any_child = [(not_picked[c][r] + picked[c][r]) % MOD for r in range(k)]
            na = [0] * k
            nb = [0] * k
            for r1 in range(k):
                for r2 in range(k):
                    r = (r1 + r2) % k
                    na[r] = (na[r] + a[r1] * any_child[r2]) % MOD
                    nb[r] = (nb[r] + b[r1] * not_picked[c][r2]) % MOD
            a, b = na, nb
        not_picked[v] = a
        picked[v] = b
    return (not_picked[0][0] + picked[0][0] - 1) % MOD
`
