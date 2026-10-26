export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Number.isInteger(obj.n) || !Array.isArray(obj.dislikes)) throw new Error('Enter JSON like {"n": 4, "dislikes": [[1,2],[1,3],[2,4]]}.')
  const { n, dislikes } = obj
  if (n < 1 || n > 20) throw new Error('n must be between 1 and 20 (visualization cap).')
  if (dislikes.length > 40) throw new Error('At most 40 dislike pairs (visualization cap).')
  const seen = new Set()
  for (const p of dislikes) {
    if (!Array.isArray(p) || p.length !== 2 || p.some(x => !Number.isInteger(x))) throw new Error('Every dislike must be [a, b].')
    const [a, b] = p
    if (a < 1 || b < 1 || a > n || b > n || a >= b) throw new Error('Pairs need 1 ≤ a < b ≤ n.')
    if (seen.has(`${a},${b}`)) throw new Error('Duplicate pairs are not allowed.')
    seen.add(`${a},${b}`)
  }
  return { n, dislikes: dislikes.map(p => [...p]) }
}

export function buildTrace({ n, dislikes }) {
  const graph = Array.from({ length: n + 1 }, () => [])
  for (const [a, b] of dislikes) { graph[a].push(b); graph[b].push(a) }
  const color = Array(n + 1).fill(0)
  const snap = () => color.slice(1)
  const frames = [{ phase: 'start', colors: snap(), node: null, other: null, queue: [], activeLine: 6, message: 'Everyone starts uncoloured (0). Colours +1 and -1 are the two groups.' }]
  let result = true
  outer:
  for (let start = 1; start <= n; start++) {
    if (color[start]) continue
    color[start] = 1
    const queue = [start]
    frames.push({ phase: 'seed', colors: snap(), node: start, other: null, queue: [...queue], activeLine: 10, message: `Person ${start} is uncoloured: put them in group +1 and start a BFS for their connected component.` })
    let head = 0
    while (head < queue.length) {
      const u = queue[head++]
      frames.push({ phase: 'visit', colors: snap(), node: u, other: null, queue: queue.slice(head), activeLine: 13, message: `Dequeue person ${u} (group ${color[u]}). Check everyone they dislike.` })
      for (const v of graph[u]) {
        if (color[v] === color[u]) {
          result = false
          frames.push({ phase: 'conflict', colors: snap(), node: u, other: v, queue: queue.slice(head), activeLine: 16, message: `Person ${u} dislikes ${v} but both are in group ${color[u]}: an odd cycle exists, so no valid split. Return False.` })
          break outer
        }
        if (color[v] === 0) {
          color[v] = -color[u]
          queue.push(v)
          frames.push({ phase: 'color', colors: snap(), node: u, other: v, queue: queue.slice(head), activeLine: 18, message: `${v} is uncoloured: dislike across an edge means opposite groups, so ${v} gets ${color[v]} and joins the queue.` })
        } else {
          frames.push({ phase: 'color', colors: snap(), node: u, other: v, queue: queue.slice(head), activeLine: 15, message: `${v} is already in group ${color[v]}, opposite to ${u}: consistent.` })
        }
      }
    }
  }
  frames.push({ phase: 'done', colors: snap(), node: null, other: null, queue: [], activeLine: result ? 20 : 16, message: result ? 'Every component was two-coloured: return True.' : 'Conflict found: return False.' })
  return { input: { n, dislikes }, result, frames }
}

export const code = `def possibleBipartition(n, dislikes):
    graph = [[] for _ in range(n + 1)]
    for a, b in dislikes:
        graph[a].append(b)
        graph[b].append(a)
    color = [0] * (n + 1)
    for start in range(1, n + 1):
        if color[start]:
            continue
        color[start] = 1
        queue = deque([start])
        while queue:
            u = queue.popleft()
            for v in graph[u]:
                if color[v] == color[u]:
                    return False
                if color[v] == 0:
                    color[v] = -color[u]
                    queue.append(v)
    return True`.split('\n').map((text, index) => ({ line: index + 1, text }))
