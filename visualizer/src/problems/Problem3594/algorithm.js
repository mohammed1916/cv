const MAX_PEOPLE = 6

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, k, m, time and mul.')
  const { n, k, m, time, mul } = input
  if (!Number.isInteger(n) || n < 1) throw new Error('n must be a positive integer.')
  if (n > MAX_PEOPLE) throw new Error(`This visualization handles up to ${MAX_PEOPLE} people; the task allows 12.`)
  if (!Number.isInteger(k) || k < 1 || k > 5) throw new Error('k must be an integer from 1 to 5.')
  if (!Number.isInteger(m) || m < 1 || m > 5) throw new Error('m must be an integer from 1 to 5.')
  if (!Array.isArray(time) || time.length !== n) throw new Error('time must have n entries.')
  if (!Array.isArray(mul) || mul.length !== m) throw new Error('mul must have m entries.')
  for (const t of time) if (!Number.isInteger(t) || t < 1 || t > 100) throw new Error('Each time is an integer from 1 to 100.')
  for (const x of mul) if (typeof x !== 'number' || !(x >= 0.5 && x <= 2)) throw new Error('Each multiplier is from 0.5 to 2.0.')
  return { n, k, m, time, mul }
}

export const phases = [
  { id: 'start', label: 'Start', description: 'Everyone is at camp with the boat, at time 0 and stage 0.' },
  { id: 'pop', label: 'Pop', description: 'Take the earliest state still waiting in the queue.' },
  { id: 'stale', label: 'Stale', description: 'A faster way to this state was already found, so skip it.' },
  { id: 'relax', label: 'Improve', description: 'This trip reaches a state sooner than any trip so far.' },
  { id: 'skip', label: 'No gain', description: 'The remaining trips reach their states no sooner than already known.' },
  { id: 'goal', label: 'Goal', description: 'The earliest state with nobody at camp is the answer.' },
  { id: 'route', label: 'Route', description: 'Replay the fastest sequence of trips.' },
  { id: 'done', label: 'Result', description: 'Report the least total time or -1.' },
]

export const code = `least total time to bring everyone across
  a state is (who is at camp, which bank has the boat, current stage)
  start at time 0 with everyone at camp, the boat at camp, stage 0
  while the queue of states is not empty
    pop the state with the smallest time
    if a faster way to this state is known, skip it
    if nobody is at camp, this time is the answer
    list the trips: up to k people forward, or one person back
    for each trip
      its length is the slowest rower's time times mul[stage]
      the next stage is (stage + floor(length)) mod m
      if this reaches the next state sooner, record it and queue it
  the queue ran out with people still at camp, return -1`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `import heapq
from math import floor


def min_time(n, k, m, time, mul):
    def bits(mask):
        return [i for i in range(n) if mask >> i & 1]

    everyone = (1 << n) - 1
    best = {(everyone, 0, 0): 0.0}
    queue = [(0.0, everyone, 0, 0)]
    while queue:
        t, camp, side, stage = heapq.heappop(queue)
        if t > best[(camp, side, stage)]:
            continue
        if camp == 0:
            return t
        if side == 0:
            trips = [s for s in range(1, everyone + 1)
                     if s & camp == s and len(bits(s)) <= k]
        else:
            trips = [1 << i for i in bits(everyone ^ camp)]
        for group in trips:
            length = max(time[i] for i in bits(group)) * mul[stage]
            next_stage = (stage + floor(length)) % m
            state = (camp ^ group, 1 - side, next_stage)
            if t + length < best.get(state, float("inf")):
                best[state] = t + length
                heapq.heappush(queue, (t + length, *state))
    return -1.0
`

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Pseudocode line missing: ${s}`)
  return index + 1
}
const pyLines = python.trim().split('\n')
const P = s => {
  const index = pyLines.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Python line missing: ${s}`)
  return index + 1
}

const bitsOf = (mask, n) => Array.from({ length: n }, (_, i) => i).filter(i => mask >> i & 1)
const money = x => x.toFixed(2)
const setName = (mask, n) => `{${bitsOf(mask, n).join(', ')}}`
const stateKey = (camp, side, stage) => `${camp}|${side}|${stage}`
const before = (a, b) => a.t - b.t || a.camp - b.camp || a.side - b.side || a.stage - b.stage
const QUEUE_SHOWN = 6

export function buildTrace({ n, k, m, time, mul }) {
  const everyone = (1 << n) - 1
  const frames = []
  const best = new Map([[stateKey(everyone, 0, 0), 0]])
  const parent = new Map()
  let queue = [{ t: 0, camp: everyone, side: 0, stage: 0 }]
  let settled = 0

  const queueRows = () => queue.slice(0, QUEUE_SHOWN).map(s => ({
    time: money(s.t), 'at camp': setName(s.camp, n), boat: s.side === 0 ? 'camp' : 'far bank', stage: s.stage,
  }))
  const push = (phase, activeLine, pythonLine, message, cur, extra = {}) => frames.push({
    phase, activeLine, pythonLine, message, t: cur.t, camp: cur.camp, side: cur.side, stage: cur.stage,
    trip: null, options: [], cursor: -1, queueRows: queueRows(), queueSize: queue.length, settled, states: best.size, route: [], routeIndex: -1, ...extra,
  })
  const routeTo = (cur) => {
    const out = []
    let key = stateKey(cur.camp, cur.side, cur.stage)
    while (parent.has(key)) {
      const edge = parent.get(key)
      out.push(edge)
      key = edge.fromKey
    }
    return out.reverse()
  }

  const start = { t: 0, camp: everyone, side: 0, stage: 0 }
  push('start', L('start at time 0'), P('queue = [('), `All ${n} ${n === 1 ? 'person is' : 'people are'} at camp with the boat. The clock reads 0 and the stage is 0.`, start)

  let answer = -1
  let goal = null
  while (queue.length) {
    const cur = queue.shift()
    const { t, camp, side, stage } = cur
    const known = best.get(stateKey(camp, side, stage))
    const path = routeTo(cur)
    if (t > known) {
      push('stale', L('if a faster way'), P('if t > best'), `This entry says ${money(t)}, but the same state was already reached at ${money(known)}. Ignore it.`, cur, { route: path })
      continue
    }
    settled++
    if (camp === 0) {
      answer = t
      goal = cur
      push('goal', L('if nobody is at camp'), P('return t'), `Nobody is left at camp. The queue pops states earliest first, so ${money(t)} cannot be beaten.`, cur, { route: path })
      break
    }
    const trips = []
    if (side === 0) {
      for (let s = 1; s <= everyone; s++) if ((s & camp) === s && bitsOf(s, n).length <= k) trips.push(s)
    } else {
      for (const i of bitsOf(everyone ^ camp, n)) trips.push(1 << i)
    }
    const options = trips.map(group => {
      const people = bitsOf(group, n)
      const slowest = Math.max(...people.map(i => time[i]))
      const length = slowest * mul[stage]
      const nextStage = (stage + Math.floor(length)) % m
      const nextCamp = camp ^ group
      const arrival = t + length
      const key = stateKey(nextCamp, 1 - side, nextStage)
      const previous = best.get(key)
      const improves = previous === undefined || arrival < previous
      return { group, people, slowest, length, nextStage, nextCamp, arrival, key, previous, improves }
    })
    const optionRows = options.map(o => ({
      group: o.people.join(', '), length: `${o.slowest} × ${mul[stage]} = ${money(o.length)}`, 'next stage': o.nextStage, arrives: money(o.arrival),
      outcome: o.improves ? 'better' : `no gain (${money(o.previous)} known)`,
    }))
    const rule = side === 0 ? `Up to ${k} of ${setName(camp, n)} can go forward` : `One of ${setName(everyone ^ camp, n)} must row back`
    push('pop', L('pop the state'), P('heapq.heappop'), `Earliest waiting state: time ${money(t)}, stage ${stage}, boat at ${side === 0 ? 'camp' : 'the far bank'}. ${rule}, ${options.length} trip${options.length === 1 ? '' : 's'} in all.`, cur, { options: optionRows, route: path })
    let lastShown = -1
    options.forEach((o, index) => {
      if (!o.improves) return
      best.set(o.key, o.arrival)
      parent.set(o.key, { fromKey: stateKey(camp, side, stage), group: o.group, people: o.people, side, stage, length: o.length, slowest: o.slowest, nextStage: o.nextStage, arrival: o.arrival, nextCamp: o.nextCamp })
      queue.push({ t: o.arrival, camp: o.nextCamp, side: 1 - side, stage: o.nextStage })
      queue.sort(before)
      lastShown = index
      push('relax', L('if this reaches the next state'), P('if t + length <'),
        `${side === 0 ? 'Send' : 'Bring back'} ${o.people.join(' and ')}: ${o.slowest} × ${mul[stage]} = ${money(o.length)}, arriving at ${money(o.arrival)}. Stage (${stage} + ${Math.floor(o.length)}) mod ${m} = ${o.nextStage}.${o.previous === undefined ? ' First way to reach this state.' : ` Beats ${money(o.previous)}.`}`,
        cur, { trip: { people: o.people, length: o.length, nextStage: o.nextStage, slowest: o.slowest }, options: optionRows, cursor: index, route: path })
    })
    if (lastShown < options.length - 1) {
      const skipped = options.filter(o => !o.improves).length
      push('skip', L('if this reaches the next state'), P('if t + length <'), `${skipped} trip${skipped === 1 ? '' : 's'} from this state reach${skipped === 1 ? 'es' : ''} nothing sooner than already known, so nothing is queued for ${skipped === 1 ? 'it' : 'them'}.`, cur, { options: optionRows, cursor: options.length - 1, route: path })
    }
  }

  if (goal) {
    const route = routeTo(goal)
    route.forEach((edge, routeIndex) => {
      const previous = routeIndex === 0 ? start : { t: route[routeIndex - 1].arrival, camp: route[routeIndex - 1].nextCamp, side: 1 - route[routeIndex - 1].side, stage: route[routeIndex - 1].nextStage }
      push('route', L('if nobody is at camp'), P('return t'),
        `Trip ${routeIndex + 1} of ${route.length}: ${edge.side === 0 ? 'forward' : 'back'} with ${edge.people.join(' and ')}, ${edge.slowest} × ${mul[edge.stage]} = ${money(edge.length)}, clock ${money(previous.t)} to ${money(edge.arrival)}.`,
        previous, { trip: { people: edge.people, length: edge.length, nextStage: edge.nextStage, slowest: edge.slowest }, route, routeIndex })
    })
    const result = Number(answer.toFixed(5))
    push('done', L('if nobody is at camp'), P('return t'), `Return ${money(answer)}: the least total time over every possible sequence of trips.`, goal, { route, routeIndex: route.length })
    return { input: { n, k, m, time, mul }, result, frames }
  }
  push('done', L('the queue ran out'), P('return -1.0'), `Every reachable state was tried and someone is always left at camp${k === 1 ? ': with room for one, whoever crosses must also row back' : ''}. Return -1.`, { t: 0, camp: everyone, side: 0, stage: 0 })
  return { input: { n, k, m, time, mul }, result: -1, frames }
}
