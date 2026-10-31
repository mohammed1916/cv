export function parseInput(text) {
  const g = JSON.parse(text)
  const n = Array.isArray(g) ? g.length : 0
  if (n < 3 || n > 16) throw new Error('Enter an adjacency list (JSON array of arrays) with 3 to 16 nodes (capped at 16 for visualization).')
  for (let i = 0; i < n; i++) {
    if (!Array.isArray(g[i]) || !g[i].length || g[i].some(v => !Number.isInteger(v) || v < 0 || v >= n || v === i) || new Set(g[i]).size !== g[i].length) throw new Error(`Node ${i} needs a non-empty list of distinct neighbours other than itself.`)
  }
  for (let i = 0; i < n; i++) for (const j of g[i]) if (!g[j].includes(i)) throw new Error(`Edge ${i}-${j} must be listed from both endpoints (the graph is undirected).`)
  return g.map(r => [...r])
}
const at = s => code.findIndex(c => c.text.includes(s)) + 1
const SYMBOL = ['·', 'M', 'C']
export function buildTrace(graph) {
  const n = graph.length
  const color = [null, ...[1, 2].map(() => Array.from({ length: n }, () => new Array(n).fill(0)))]
  const degree = [null, ...[1, 2].map(() => Array.from({ length: n }, () => new Array(n).fill(0)))]
  for (let m = 0; m < n; m++) for (let c = 1; c < n; c++) {
    degree[1][m][c] = graph[m].length
    degree[2][m][c] = graph[c].filter(x => x !== 0).length
  }
  const queue = []
  for (let c = 1; c < n; c++) for (const t of [1, 2]) {
    color[t][0][c] = 1; queue.push([0, c, t, 1])
    color[t][c][c] = 2; queue.push([c, c, t, 2])
  }
  const snap = () => ({ mouseTurn: color[1].map(r => r.map(v => SYMBOL[v])), catTurn: color[2].map(r => r.map(v => SYMBOL[v])), queueLength: queue.length })
  const frames = [{ phase: 'start', pythonLine: 4, activeLine: at('Let n be the number'), ...snap(), colored: [], message: 'Seed the known outcomes: mouse in the hole (0) is a mouse win, and cat on the mouse is a cat win, for either player to move.' }]
  let head = 0
  while (head < queue.length) {
    const [m, c, t, res] = queue[head++]
    const parents = t === 2 ? graph[m].map(pm => [pm, c, 1]) : graph[c].filter(pc => pc > 0).map(pc => [m, pc, 2])
    const colored = [], notes = []
    for (const [pm, pc, pt] of parents) {
      if (color[pt][pm][pc]) continue
      if (pt === res) {
        color[pt][pm][pc] = res; queue.push([pm, pc, pt, res]); colored.push([pt, pm, pc])
        notes.push(`${pt === 1 ? 'mouse' : 'cat'} to move at (mouse ${pm}, cat ${pc}) can move into this ${SYMBOL[res] === 'M' ? 'mouse' : 'cat'} win and takes it`)
      } else {
        degree[pt][pm][pc]--
        if (degree[pt][pm][pc] === 0) {
          color[pt][pm][pc] = res; queue.push([pm, pc, pt, res]); colored.push([pt, pm, pc])
          notes.push(`every move from (mouse ${pm}, cat ${pc}) with ${pt === 1 ? 'mouse' : 'cat'} to move leads to a ${res === 1 ? 'mouse' : 'cat'} win`)
        } else notes.push(`(mouse ${pm}, cat ${pc}, ${pt === 1 ? 'mouse' : 'cat'} to move) loses one escape move (${degree[pt][pm][pc]} left)`)
      }
    }
    frames.push({ phase: 'propagate', pythonLine: 23, activeLine: at('for each parent state'), ...snap(), turn: t, cell: [m, c], colored,
      message: `Pop state (mouse ${m}, cat ${c}, ${t === 1 ? 'mouse' : 'cat'} to move) = ${res === 1 ? 'mouse win' : 'cat win'}. ${notes.length ? notes.join('; ') + '.' : 'No predecessor changes.'}` })
  }
  const result = color[1][1][2]
  frames.push({ phase: 'done', pythonLine: 35, activeLine: at('return the color of'), ...snap(), turn: 1, cell: [1, 2], colored: [], message: result === 0 ? 'The start state (mouse 1, cat 2) never got a forced result: draw.' : `The start state is a forced ${result === 1 ? 'mouse' : 'cat'} win.` })
  return { input: graph, result, frames }
}
export const code = `Let n be the number of nodes; color and degree start empty, and the cat may never enter hole 0
for each mouse node m and each cat node c from 1 to n - 1
  set degree of (m, c, mouse to move) to the number of mouse moves from m
  set degree of (m, c, cat to move) to the number of cat moves from c that avoid hole 0
Seed the queue with known results for both turns: mouse in hole 0 is a mouse win (1), cat on the mouse is a cat win (2)
while the queue is not empty
  pop state (m, c, t) with result res
  for each parent state (pm, pc, pt) of (m, c, t)
    if (pm, pc, pt) is already colored, skip it
    if pt equals res, the player to move can take this winning move: color it res and queue it
    otherwise decrement degree of (pm, pc, pt), and if it reaches 0 color it res and queue it
return the color of (mouse 1, cat 2, mouse to move), where 0 means a draw`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `from collections import deque

def cat_mouse_game(graph):
    n = len(graph)
    color = {}
    degree = {}
    for m in range(n):
        for c in range(1, n):
            degree[m, c, 1] = len(graph[m])
            degree[m, c, 2] = len([x for x in graph[c] if x != 0])
    def parents(m, c, t):
        if t == 2:
            return [(pm, c, 1) for pm in graph[m]]
        return [(m, pc, 2) for pc in graph[c] if pc > 0]
    queue = deque()
    for c in range(1, n):
        for t in (1, 2):
            color[0, c, t] = 1
            queue.append((0, c, t, 1))
            color[c, c, t] = 2
            queue.append((c, c, t, 2))
    while queue:
        m, c, t, res = queue.popleft()
        for pm, pc, pt in parents(m, c, t):
            if (pm, pc, pt) in color:
                continue
            if pt == res:
                color[pm, pc, pt] = res
                queue.append((pm, pc, pt, res))
            else:
                degree[pm, pc, pt] -= 1
                if degree[pm, pc, pt] == 0:
                    color[pm, pc, pt] = res
                    queue.append((pm, pc, pt, res))
    return color.get((1, 2, 1), 0)`
