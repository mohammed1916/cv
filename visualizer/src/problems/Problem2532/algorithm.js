const BUSY = ['toRight', 'picking', 'toLeft', 'putting']
const STATE_TEXT = {
  left: 'waiting on the left',
  toRight: 'crossing to the right',
  picking: 'picking a box on the right',
  ready: 'waiting on the right with a box',
  toLeft: 'crossing back to the left',
  putting: 'putting the box on the left',
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!Number.isInteger(input?.n) || input.n < 1 || input.n > 6) throw new Error('n is an integer from 1 to 6.')
  if (!Number.isInteger(input.k) || input.k < 1 || input.k > 4) throw new Error('k is an integer from 1 to 4.')
  if (!Array.isArray(input.time) || input.time.length !== input.k || !input.time.every(t => Array.isArray(t) && t.length === 4 && t.every(v => Number.isInteger(v) && v >= 1 && v <= 9))) {
    throw new Error('time has k rows of four integers from 1 to 9: [to right, pick, to left, put].')
  }
  return { n: input.n, k: input.k, time: input.time }
}

export const code = `function findCrossingTime(n, k, time)
  status[i] <- "left" for every worker, boxes left <- n, now <- 0
  delivered <- 0, bridge free at 0
  loop
    finish every timed step that ends at now
      (crossing right -> picking, picking -> ready,
       crossing left -> putting and one box delivered, putting -> left)
    if delivered equals n, RETURN now (the last box reached the left side)
    if the bridge is free
      if a worker is ready on the right, the least efficient one crosses left
      else if boxes are left and a worker waits on the left, the least efficient one crosses right
    now <- the next time a timed step ends`.split('\n').map((text, index) => ({ line: index + 1, text }))
const CL = s => { const i = code.findIndex(c => c.text.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

export const python = `def find_crossing_time(n, k, time):
    status = ["left"] * k
    until = [0] * k
    boxes_left, delivered, now, bridge_until = n, 0, 0, 0
    while True:
        for i in range(k):
            if status[i] == "toRight" and until[i] <= now:
                status[i] = "picking"
                until[i] = now + time[i][1]
            elif status[i] == "picking" and until[i] <= now:
                status[i] = "ready"
            elif status[i] == "toLeft" and until[i] <= now:
                status[i] = "putting"
                until[i] = now + time[i][3]
                delivered += 1
                if delivered == n:
                    return now
            elif status[i] == "putting" and until[i] <= now:
                status[i] = "left"
        if bridge_until <= now:
            ready = [i for i in range(k) if status[i] == "ready"]
            idle = [i for i in range(k) if status[i] == "left"]
            if ready:
                i = max(ready, key=lambda j: (time[j][0] + time[j][2], j))
                status[i] = "toLeft"
                until[i] = now + time[i][2]
                bridge_until = until[i]
            elif boxes_left > 0 and idle:
                i = max(idle, key=lambda j: (time[j][0] + time[j][2], j))
                boxes_left -= 1
                status[i] = "toRight"
                until[i] = now + time[i][0]
                bridge_until = until[i]
        future = [until[i] for i in range(k) if status[i] in ("toRight", "picking", "toLeft", "putting") and until[i] > now]
        if bridge_until > now:
            future.append(bridge_until)
        now = min(future)
`
const PY = python.split('\n')
const PL = s => { const i = PY.findIndex(l => l.includes(s)); if (i < 0) throw new Error(`missing ${s}`); return i + 1 }

const leastEfficient = (list, time) => list.reduce((best, j) => {
  const a = time[j][0] + time[j][2], b = time[best][0] + time[best][2]
  return a > b || (a === b && j > best) ? j : best
})

export function buildTrace({ n, k, time }) {
  const status = Array(k).fill('left')
  const until = Array(k).fill(0)
  let boxesLeft = n, delivered = 0, now = 0, bridgeUntil = 0, bridgeWorker = -1, answer = null
  const frames = []
  const snap = (phase, activeLine, pythonLine, message) => frames.push({
    phase, activeLine, pythonLine, message, now, status: [...status], until: [...until], boxesLeft, delivered,
    bridgeWorker: bridgeUntil > now ? bridgeWorker : -1, result: answer,
  })
  snap('setup', CL('status[i] <-'), PL('status = ["left"]'), `${n} boxes wait on the right; ${k} workers wait on the left.`)
  for (let guard = 0; guard < 10000; guard++) {
    for (let i = 0; i < k; i++) {
      if (status[i] === 'toRight' && until[i] <= now) { status[i] = 'picking'; until[i] = now + time[i][1] }
      else if (status[i] === 'picking' && until[i] <= now) status[i] = 'ready'
      else if (status[i] === 'toLeft' && until[i] <= now) {
        status[i] = 'putting'; until[i] = now + time[i][3]; delivered += 1
        if (delivered === n) { answer = now; snap('done', CL('RETURN now'), PL('return now'), `Worker ${i} reaches the left side with the last box at minute ${now}.`); return { input: { n, k, time }, result: answer, frames } }
        snap('arrive', CL('crossing left -> putting'), PL('delivered += 1'), `Worker ${i} reaches the left side at minute ${now}; box ${delivered} is delivered.`)
      } else if (status[i] === 'putting' && until[i] <= now) status[i] = 'left'
    }
    if (bridgeUntil <= now) {
      const ready = status.map((s, i) => (s === 'ready' ? i : -1)).filter(i => i >= 0)
      const idle = status.map((s, i) => (s === 'left' ? i : -1)).filter(i => i >= 0)
      if (ready.length) {
        const i = leastEfficient(ready, time)
        status[i] = 'toLeft'; until[i] = now + time[i][2]; bridgeUntil = until[i]; bridgeWorker = i
        snap('bridgeLeft', CL('the least efficient one crosses left'), PL('ready = ['), `The bridge is free, so worker ${i} (ready on the right) crosses left.`)
      } else if (boxesLeft > 0 && idle.length) {
        const i = leastEfficient(idle, time)
        boxesLeft -= 1
        status[i] = 'toRight'; until[i] = now + time[i][0]; bridgeUntil = until[i]; bridgeWorker = i
        snap('bridgeRight', CL('crosses right'), PL('boxes_left -= 1'), `Worker ${i} crosses right to pick a box; ${boxesLeft} boxes are still unclaimed.`)
      }
    }
    const future = []
    for (let i = 0; i < k; i++) if (BUSY.includes(status[i]) && until[i] > now) future.push(until[i])
    if (bridgeUntil > now) future.push(bridgeUntil)
    if (!future.length) break
    now = Math.min(...future)
  }
  throw new Error('The crossing did not finish; check the times.')
}

export { STATE_TEXT }
