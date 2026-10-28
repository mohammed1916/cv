export function parseInput(text) {
  const input = JSON.parse(text)
  const { n, red_edges: red, blue_edges: blue } = input ?? {}
  if (!Number.isInteger(n) || n < 1 || n > 10) throw new Error('n is an integer from 1 to 10.')
  const checkEdges = (list, name) => {
    if (!Array.isArray(list) || list.length > 12) throw new Error(`${name} is a list of at most 12 pairs.`)
    if (list.some(e => !Array.isArray(e) || e.length !== 2 || e.some(v => !Number.isInteger(v) || v < 0 || v >= n))) throw new Error(`${name} pairs must hold two node numbers below n.`)
  }
  checkEdges(red, 'red_edges')
  checkEdges(blue, 'blue_edges')
  return { n, red_edges: red, blue_edges: blue }
}

export function buildTrace(input) {
  const { n, red_edges: red, blue_edges: blue } = input
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of red) adj[u].push({ to: v, colour: 'red' })
  for (const [u, v] of blue) adj[u].push({ to: v, colour: 'blue' })
  const answer = Array(n).fill(-1)
  answer[0] = 0
  const seen = new Set(['0:none'])
  const queue = [{ node: 0, last: 'none', dist: 0 }]
  const frames = [{ phase: 'start', activeLine: L('start a queue with node 0'), current: 0, last: 'none', answers: [...answer], message: 'Start at node 0. Either colour may be taken first.' }]
  for (let head = 0; head < queue.length; head++) {
    const here = queue[head]
    frames.push({ phase: 'pop', activeLine: L('take the next node'), current: here.node, last: here.last, answers: [...answer], message: `At node ${here.node} after ${here.dist} edge(s), last colour ${here.last}.` })
    for (const edge of adj[here.node]) {
      if (edge.colour === here.last) continue
      const k2 = `${edge.to}:${edge.colour}`
      if (seen.has(k2)) continue
      seen.add(k2)
      const first = answer[edge.to] === -1
      if (first) answer[edge.to] = here.dist + 1
      queue.push({ node: edge.to, last: edge.colour, dist: here.dist + 1 })
      frames.push({ phase: first ? 'reach' : 'extend', activeLine: L(first ? 'if the target has no answer yet' : 'add the target with this edge colour'), current: edge.to, last: edge.colour, answers: [...answer], message: first ? `Node ${edge.to} is first reached by a ${edge.colour} edge in ${here.dist + 1} step(s).` : `Node ${edge.to} is reached by a ${edge.colour} edge, but already has an answer.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return the answers'), current: null, last: null, answers: [...answer], message: `Answers by node: ${answer.join(', ')}.` })
  return { input, result: answer, frames }
}

export const code = `shortest alternating path lengths from node 0 to every node
  set every answer to minus one and set the answer for node 0 to zero
  start a queue with node 0 and no last colour
  repeat while the queue is not empty
    take the next node, its last colour and its distance
    for each edge out of that node whose colour differs from the last colour
      if this state of the target is not yet seen then mark it seen
      if the target has no answer yet then set its answer to distance plus one
      add the target with this edge colour to the queue
  return the answers`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def shortest_alternating_paths(n, red_edges, blue_edges):
    adj = [[] for _ in range(n)]
    for u, v in red_edges:
        adj[u].append((v, 'red'))
    for u, v in blue_edges:
        adj[u].append((v, 'blue'))
    answer = [-1] * n
    answer[0] = 0
    seen = {(0, None)}
    queue = [(0, None, 0)]
    head = 0
    while head < len(queue):
        node, last, dist = queue[head]
        head += 1
        for target, colour in adj[node]:
            if colour == last:
                continue
            if (target, colour) in seen:
                continue
            seen.add((target, colour))
            if answer[target] == -1:
                answer[target] = dist + 1
            queue.append((target, colour, dist + 1))
    return answer
`
