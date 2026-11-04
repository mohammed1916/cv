export const MAX_STATIONS = 16
export const MAX_CONNECTIONS = 40
export const MAX_QUERIES = 20

const isIn = (value, low, high) => Number.isInteger(value) && value >= low && value <= high

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with c, connections and queries.')
  const { c, connections, queries } = input
  if (!isIn(c, 1, MAX_STATIONS)) throw new Error(`c is an integer from 1 to ${MAX_STATIONS} in this visualization.`)
  if (!Array.isArray(connections) || connections.length > MAX_CONNECTIONS) throw new Error(`connections has at most ${MAX_CONNECTIONS} entries in this visualization.`)
  for (const pair of connections) {
    if (!Array.isArray(pair) || pair.length !== 2 || !isIn(pair[0], 1, c) || !isIn(pair[1], 1, c) || pair[0] === pair[1]) throw new Error('Each connection joins two different stations from 1 to c.')
  }
  if (!Array.isArray(queries) || queries.length < 1 || queries.length > MAX_QUERIES) throw new Error(`queries has 1 to ${MAX_QUERIES} entries in this visualization.`)
  for (const query of queries) {
    if (!Array.isArray(query) || query.length !== 2 || (query[0] !== 1 && query[0] !== 2) || !isIn(query[1], 1, c)) throw new Error('Each query is [1, x] for a check or [2, x] for a shutdown, with x from 1 to c.')
  }
  return { c, connections, queries }
}

export const code = `join the two ends of every cable with union-find
list each grid's stations in increasing order
give each grid a front pointer at its first station
mark every station online
for each query
  a shutdown only marks the station offline
  a check on an online station is answered by that station
  otherwise find the station's grid
    move the front past offline stations; it never moves back
    answer with the front station, or -1 if the list ran out
return the answers to the checks`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}

export const python = `def process_queries(c, connections, queries):
    parent = list(range(c + 1))
    size = [1] * (c + 1)

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for u, v in connections:
        a, b = find(u), find(v)
        if a != b:
            if size[a] < size[b]:
                a, b = b, a
            parent[b] = a
            size[a] += size[b]
    members = {}
    for station in range(1, c + 1):
        members.setdefault(find(station), []).append(station)
    front = {root: 0 for root in members}
    online = [True] * (c + 1)
    answer = []
    for kind, x in queries:
        if kind == 2:
            online[x] = False
        elif online[x]:
            answer.append(x)
        else:
            root = find(x)
            ids = members[root]
            while front[root] < len(ids) and not online[ids[front[root]]]:
                front[root] += 1
            answer.append(ids[front[root]] if front[root] < len(ids) else -1)
    return answer
`

const P = s => {
  const index = python.trim().split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Start', description: 'Each station begins as its own grid.' },
  { id: 'union', label: 'Union', description: 'Join the two ends of a cable.' },
  { id: 'group', label: 'Group', description: 'List the stations of each grid in order.' },
  { id: 'query', label: 'Query', description: 'Read the next query.' },
  { id: 'offline', label: 'Offline', description: 'A station shuts down; the grid keeps its shape.' },
  { id: 'online', label: 'Self', description: 'A running station answers its own check.' },
  { id: 'lookup', label: 'Lookup', description: 'An offline station hands the check to its grid.' },
  { id: 'advance', label: 'Advance', description: 'The front pointer skips an offline station.' },
  { id: 'resolve', label: 'Resolve', description: 'The front station answers, or -1.' },
  { id: 'done', label: 'Result', description: 'Report the answers.' },
]

export function buildTrace({ c, connections, queries }) {
  const frames = []
  // Stations are 1-based on screen; union-find state is 0-based so the shared view can draw it.
  const parent = Array.from({ length: c }, (_, i) => i)
  const size = new Array(c).fill(1)
  const members = []
  const front = {}
  const online = new Array(c).fill(true)
  const answers = []
  const log = queries.map(([kind, x]) => ({ name: kind === 1 ? 'check' : 'shutdown', args: [x] }))
  let queryIndex = -1

  const rootOf = i => { let x = i; while (parent[x] !== x) x = parent[x]; return x }
  const find = start => {
    let x = start
    const chain = [x], repointed = []
    while (parent[x] !== x) {
      const from = parent[x], to = parent[from]
      if (from !== to) { parent[x] = to; repointed.push({ node: x, from, to }) }
      x = parent[x]
      chain.push(x)
    }
    return { type: 'find', node: start, chain, repointed, root: x }
  }
  const push = (phase, activeLine, pythonLine, message, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message,
    parent: [...parent], size: [...size], gridOf: parent.map((_, i) => rootOf(i) + 1),
    members: members.map(grid => ({ root: grid.root, ids: [...grid.ids] })), front: { ...front }, online: [...online],
    answers: [...answers], log: log.map(entry => ({ ...entry })), queryIndex,
    ops: [], cable: null, focus: null, grid: null, ...extra,
  })

  push('start', L('join the two'), P('parent = list(range'), `${c} station${c === 1 ? '' : 's'}, each alone until its cables are read.`)
  for (const [u, v] of connections) {
    const findA = find(u - 1), findB = find(v - 1)
    let a = findA.root, b = findB.root
    const rootA = a, rootB = b
    const op = { type: 'union', a: u - 1, b: v - 1, rootA, rootB, merged: a !== b }
    if (a !== b) {
      if (size[a] < size[b]) [a, b] = [b, a]
      op.winner = a
      op.loser = b
      op.winnerSize = size[a]
      op.loserSize = size[b]
      parent[b] = a
      size[a] += size[b]
    }
    push('union', L('join the two'), op.merged ? P('size[a] += size[b]') : P('if a != b'),
      op.merged ? `The cable ${u} and ${v} merges two grids into one with ${size[op.winner]} stations.` : `The cable ${u} and ${v} adds nothing new: both stations are already in one grid.`,
      { ops: [findA, findB, op], cable: [u, v] })
  }
  for (let station = 1; station <= c; station++) {
    const op = find(station - 1)
    const root = op.root + 1
    let grid = members.find(entry => entry.root === root)
    if (!grid) { grid = { root, ids: [] }; members.push(grid) }
    grid.ids.push(station)
    push('group', L('list each grid'), P('members.setdefault'), `Station ${station} joins the list of the grid rooted at ${root}. Going through stations in order keeps the list sorted.`, { ops: [op], focus: station, grid: root })
  }
  for (const grid of members) front[grid.root] = 0
  push('group', L('give each grid'), P('front = {root'), `${members.length} grid${members.length === 1 ? '' : 's'} ready. Each front pointer starts at the smallest station, and every station is online.`)

  queries.forEach(([kind, x], index) => {
    queryIndex = index
    push('query', L('for each query'), P('for kind, x in queries'), kind === 2 ? `Query ${index + 1}: shut down station ${x}.` : `Query ${index + 1}: a check for station ${x}.`, { focus: x })
    if (kind === 2) {
      const already = !online[x - 1]
      online[x - 1] = false
      log[index].returned = null
      push('offline', L('a shutdown'), P('online[x] = False'), already ? `Station ${x} was already offline, so nothing changes.` : `Station ${x} goes offline. Its cables stay, so its grid keeps the same stations. No pointer moves yet.`, { focus: x })
      return
    }
    if (online[x - 1]) {
      answers.push(x)
      log[index].returned = x
      push('online', L('a check on an online'), P('answer.append(x)'), `Station ${x} is running, so it answers its own check, whatever smaller stations exist.`, { focus: x })
      return
    }
    const op = find(x - 1)
    const root = op.root + 1
    const ids = members.find(entry => entry.root === root).ids
    push('lookup', L('otherwise find'), P('root = find(x)'), `Station ${x} is offline, so the check goes to the grid rooted at ${root}.`, { focus: x, grid: root, ops: [op] })
    while (front[root] < ids.length && !online[ids[front[root]] - 1]) {
      const skipped = ids[front[root]]
      front[root]++
      push('advance', L('move the front'), P('front[root] += 1'), `Station ${skipped} is offline and stations never restart, so the pointer moves past it for good.`, { focus: x, grid: root, skipped })
    }
    const value = front[root] < ids.length ? ids[front[root]] : -1
    answers.push(value)
    log[index].returned = value
    push('resolve', L('answer with the front'), P('answer.append(ids[front[root]]'), value === -1 ? `The pointer ran off the list: no station in this grid is running, so the answer is -1.` : `Station ${value} is the smallest running station in this grid, so it takes the check.`, { focus: x, grid: root, answered: value })
  })
  push('done', L('return the answers'), P('return answer'), answers.length ? `The answers are ${answers.join(', ')}.` : 'No query asked for a check, so the list is empty.')
  return { input: { c, connections, queries }, result: answers, frames }
}
