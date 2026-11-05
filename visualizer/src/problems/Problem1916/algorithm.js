// LeetCode 1916: the rooms form a tree rooted at 0 and each room must follow its parent. The number of build orders is n! divided by the product of every subtree size, taken modulo 1000000007.
const MOD = 1000000007n
const SOURCE = [
  "function waysToBuildRooms(prevRoom) {",
  "  const MOD = 1000000007n",
  "  const n = prevRoom.length",
  "  const children = Array.from({ length: n }, () => [])",
  "  for (let i = 1; i < n; i++) children[prevRoom[i]].push(i)",
  "  const order = [0]",
  "  for (let k = 0; k < order.length; k++) order.push(...children[order[k]])",
  "  const size = new Array(n).fill(1)",
  "  for (const v of [...order].reverse()) if (v !== 0) size[prevRoom[v]] += size[v]",
  "  let result = 1n",
  "  for (let i = 1; i <= n; i++) result = result * BigInt(i) % MOD",
  "  for (const s of size) result = result * powMod(s, MOD - 2n) % MOD",
  "  return Number(result)",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `MOD = 10**9 + 7

def ways_to_build_rooms(prev_room):
    n = len(prev_room)
    children = [[] for _ in range(n)]
    for i in range(1, n):
        children[prev_room[i]].append(i)
    order = [0]
    for v in order:
        order.extend(children[v])
    size = [1] * n
    for v in reversed(order):
        if v != 0:
            size[prev_room[v]] += size[v]
    result = 1
    for i in range(1, n + 1):
        result = result * i % MOD
    for v in range(n):
        result = result * pow(size[v], MOD - 2, MOD) % MOD
    return result
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }
const powMod = (base, exp) => {
  let result = 1n, b = ((BigInt(base) % MOD) + MOD) % MOD, e = BigInt(exp)
  while (e > 0n) { if (e & 1n) result = (result * b) % MOD; b = (b * b) % MOD; e >>= 1n }
  return result
}

export const phases = [
  { id: 'order', label: 'Prerequisite map', description: 'List each room with its prerequisite and the build order from room 0.' },
  { id: 'sizes', label: 'Subtree sizes', description: 'Count the rooms that depend on each room, child before parent.' },
  { id: 'divide', label: 'Divide', description: 'Divide n! by each subtree size.' },
  { id: 'done', label: 'Result', description: 'Build orders modulo 1000000007.' },
]

export function parseInput(text) {
  let prev
  try { prev = JSON.parse(text) } catch { throw new Error('Enter a JSON array prevRoom, for example [-1,0,0,1,1].') }
  if (!Array.isArray(prev) || prev.length < 1 || prev.length > 12 || prev[0] !== -1) throw new Error('prevRoom has 1 to 12 entries and starts with -1.')
  const n = prev.length
  for (let i = 1; i < n; i++) {
    if (!Number.isInteger(prev[i]) || prev[i] < 0 || prev[i] >= n || prev[i] === i) throw new Error('Each prevRoom[i] (i > 0) is another room below n.')
    let v = i, steps = 0
    while (v !== 0 && steps <= n) { v = prev[v]; steps++ }
    if (v !== 0) throw new Error('Every room must lead back to room 0 without a cycle.')
  }
  return { prevRoom: prev }
}

export function buildTrace({ prevRoom }) {
  const n = prevRoom.length
  const children = Array.from({ length: n }, () => [])
  for (let i = 1; i < n; i++) children[prevRoom[i]].push(i)
  const order = [0]
  for (let k = 0; k < order.length; k++) order.push(...children[order[k]])
  const size = new Array(n).fill(1)
  const frames = []
  const map = prevRoom.map((p, room) => ({ room, prereq: p }))
  for (const v of [...order].reverse()) {
    if (v !== 0) size[prevRoom[v]] += size[v]
    frames.push({ phase: 'sizes', activeLine: L('for (const v of [...order].reverse())'), pythonLine: P('for v in reversed(order)'), message: `Room ${v} has ${size[v]} room(s) in its subtree, itself included.`, room: v, order: [...order], map, size: [...size], factor: null, result: null })
  }
  let factorial = 1n
  for (let i = 1; i <= n; i++) factorial = factorial * BigInt(i) % MOD
  let result = factorial
  frames.push({ phase: 'divide', activeLine: L('let result = 1n'), pythonLine: P('result = 1'), message: `Start with ${n}! = ${factorial} modulo 1000000007.`, room: null, order: [...order], map, size: [...size], factor: null, result: Number(result) })
  for (let v = 0; v < n; v++) {
    result = result * powMod(size[v], MOD - 2n) % MOD
    frames.push({ phase: 'divide', activeLine: L('result = result * powMod'), pythonLine: P('pow(size[v]'), message: `Multiply by the inverse of ${size[v]} (room ${v}).`, room: v, order: [...order], map, size: [...size], factor: size[v], result: Number(result) })
  }
  frames.push({ phase: 'done', activeLine: L('return Number(result)'), pythonLine: P('return result'), message: `${Number(result)} build order(s).`, room: -1, order: [...order], map, size: [...size], factor: null, result: Number(result) })
  return { input: { prevRoom }, result: Number(result), frames, tree: plain(children, 0) }
}

function plain(children, v) {
  return { id: v, children: children[v].map(c => plain(children, c)) }
}
