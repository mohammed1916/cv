const MAX_NODES = 12
const MAX_QUERIES = 6

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums, maxDiff and queries.')
  const { nums, maxDiff, queries } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_NODES) throw new Error(`nums has 1 to ${MAX_NODES} entries here.`)
  for (const value of nums) if (!Number.isInteger(value) || value < 0 || value > 1e5) throw new Error('Each entry of nums is an integer from 0 to 100000.')
  if (!Number.isInteger(maxDiff) || maxDiff < 0 || maxDiff > 1e5) throw new Error('maxDiff is an integer from 0 to 100000.')
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > MAX_QUERIES) throw new Error(`queries has 1 to ${MAX_QUERIES} entries here.`)
  for (const query of queries) {
    if (!Array.isArray(query) || query.length !== 2 || !query.every(x => Number.isInteger(x) && x >= 0 && x < nums.length)) throw new Error('Each query is a pair of node indices.')
  }
  return { nums, maxDiff, queries }
}

export const code = `shortest path queries on a value-difference graph
  sort the nodes by value and remember each node's sorted position
  for each sorted position l
    slide r right while value[r + 1] - value[l] is at most maxDiff
    far[l] = r, the longest single hop forward from l
  lift[0] = far
  for each level k above 0, and each position p
    lift[k][p] = lift[k - 1][lift[k - 1][p]], which is 2^k hops from p
  for each query (u, v)
    if u equals v the answer is 0
    let a and b be their sorted positions with a before b, and hops = 0
    for k from the highest level down
      if 2^k hops from a still stop short of b
        move a there and add 2^k to hops
    one more hop reaches b: answer hops + 1, otherwise -1
  return all answers`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def path_queries(nums, max_diff, queries):
    n = len(nums)
    order = sorted(range(n), key=lambda i: nums[i])
    pos = [0] * n
    for p, node in enumerate(order):
        pos[node] = p
    levels = max(1, (n - 1).bit_length())
    far = [0] * n
    r = 0
    for l in range(n):
        while r + 1 < n and nums[order[r + 1]] - nums[order[l]] <= max_diff:
            r += 1
        far[l] = r
    lift = [far]
    for k in range(1, levels):
        row = [0] * n
        for p in range(n):
            row[p] = lift[k - 1][lift[k - 1][p]]
        lift.append(row)
    answers = []
    for u, v in queries:
        if u == v:
            answers.append(0)
            continue
        a, b = sorted((pos[u], pos[v]))
        hops = 0
        for k in range(levels - 1, -1, -1):
            if lift[k][a] < b:
                a = lift[k][a]
                hops += 1 << k
        answers.append(hops + 1 if far[a] >= b else -1)
    return answers
`

const pythonLines = python.split('\n')
const lineIn = (lines, fragment) => {
  const index = lines.findIndex(text => text.includes(fragment))
  if (index < 0) throw new Error(`Line missing: ${fragment}`)
  return index + 1
}
const L = fragment => lineIn(code.map(entry => entry.text), fragment)
const P = fragment => lineIn(pythonLines, fragment)

export function buildTrace({ nums, maxDiff, queries }) {
  const n = nums.length
  const order = Array.from({ length: n }, (_, i) => i).sort((x, y) => nums[x] - nums[y] || x - y)
  const pos = new Array(n)
  order.forEach((node, p) => { pos[node] = p })
  const levels = Math.max(1, (n - 1).toString(2).length * (n > 1 ? 1 : 0))
  const lift = Array.from({ length: levels }, () => new Array(n).fill(null))
  const edges = []
  for (let u = 0; u < n; u++) for (let v = u + 1; v < n; v++) if (Math.abs(nums[u] - nums[v]) <= maxDiff) edges.push([u, v])
  const frames = []
  const answers = queries.map(() => null)
  const push = (phase, codeLine, pyLine, message, extra = {}) => frames.push({
    phase, activeLine: L(codeLine), pythonLine: P(pyLine), message,
    order, sorted: order.map(node => nums[node]), edges, levels,
    lift: lift.map(row => [...row]), answers: [...answers],
    l: null, r: null, cell: null, sources: [], query: null, a: null, b: null, hops: 0, trial: null, jumps: [], ...extra,
  })

  push('sort', 'sort the nodes by value', 'order = sorted', `Sorted by value, the nodes read ${order.join(', ')}. In this order every neighbour of a node sits in one continuous stretch around it.`)
  let r = 0
  for (let l = 0; l < n; l++) {
    while (r + 1 < n && nums[order[r + 1]] - nums[order[l]] <= maxDiff) r += 1
    lift[0][l] = r
    push('window', 'far[l] = r', 'far[l] = r', r === l
      ? `From position ${l} (value ${nums[order[l]]}) no later value is within ${maxDiff}, so far[${l}] = ${l}.`
      : `From position ${l} (value ${nums[order[l]]}) the window reaches position ${r} (value ${nums[order[r]]}), so far[${l}] = ${r}.`, { l, r, cell: { k: 0, p: l } })
  }
  for (let k = 1; k < levels; k++) {
    for (let p = 0; p < n; p++) {
      const mid = lift[k - 1][p]
      lift[k][p] = lift[k - 1][mid]
      push('lift', 'lift[k][p] = lift[k - 1]', 'row[p] = lift', `${2 ** k} hops from ${p}: ${2 ** (k - 1)} hops reach ${mid}, ${2 ** (k - 1)} more reach ${lift[k][p]}.`, {
        cell: { k, p }, sources: [{ k: k - 1, p }, { k: k - 1, p: mid }],
        trial: { from: p, to: lift[k][p], k, take: true },
      })
    }
  }
  const far = lift[0]
  queries.forEach(([u, v], index) => {
    const base = { query: index }
    if (u === v) {
      answers[index] = 0
      push('answer', 'if u equals v', 'answers.append(0)', `Query ${index}: node ${u} to itself takes 0 edges.`, { ...base, a: pos[u], b: pos[v] })
      return
    }
    let a = Math.min(pos[u], pos[v])
    const b = Math.max(pos[u], pos[v])
    let hops = 0
    const jumps = []
    push('query', 'let a and b be', 'a, b = sorted', `Query ${index}: nodes ${u} and ${v} sit at positions ${pos[u]} and ${pos[v]}. Move from position ${a} toward position ${b}.`, { ...base, a, b, hops })
    for (let k = levels - 1; k >= 0; k--) {
      const to = lift[k][a]
      const take = to < b
      push('test', 'if 2^k hops from a', 'if lift[k][a] < b', take
        ? `${2 ** k} hop${k ? 's' : ''} from ${a} land at ${to}, still before ${b}. Safe to take.`
        : `${2 ** k} hop${k ? 's' : ''} from ${a} land at ${to}, not before ${b}. Skip this size.`, { ...base, a, b, hops, jumps: [...jumps], trial: { from: a, to, k, take } })
      if (take) {
        jumps.push({ from: a, to, k })
        a = to
        hops += 2 ** k
        push('jump', 'move a there', 'a = lift[k][a]', `Move to position ${a}; ${hops} hop${hops === 1 ? '' : 's'} so far.`, { ...base, a, b, hops, jumps: [...jumps] })
      }
    }
    const reaches = far[a] >= b
    answers[index] = reaches ? hops + 1 : -1
    push('answer', 'one more hop reaches b', 'answers.append(hops + 1', reaches
      ? `One hop from ${a} reaches as far as ${far[a]}, which covers ${b}. Answer ${hops + 1}.`
      : `The furthest hop from ${a} stops at ${far[a]}, before ${b}. A gap wider than ${maxDiff} blocks the way: answer -1.`, { ...base, a, b, hops, jumps: [...jumps], trial: { from: a, to: far[a], k: 0, take: reaches } })
  })
  push('done', 'return all answers', 'return answers', `The answers are ${JSON.stringify(answers)}.`)
  return { input: { nums, maxDiff, queries }, result: answers, frames }
}
