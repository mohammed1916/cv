import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'

const code = [
  'every worker starts idle on the left; boxes left to pick = n',
  'loop while boxes are still not delivered',
  '  finish any action that ends at the current time',
  '  if the bridge is free and a worker is on the right with boxes left to pick, send them back left',
  '  otherwise if a worker on the left holds a box, send the best one right',
  '  idle workers on the left start picking while boxes remain',
  '  jump the clock to the next event time',
  'return the time the last box was put down',
].map((text, index) => ({ line: index + 1, text }))

const python = `import heapq

def time_to_cross(n, k, time):
    left_boxes, delivered, now = n, 0, 0
    status = ['left'] * k
    until = [0] * k
    bridge_until = 0
    last_put = 0
    while delivered < n:
        for i in range(k):
            if status[i] == 'picking' and until[i] <= now:
                status[i] = 'ready'
            elif status[i] == 'crossing_right' and until[i] <= now:
                status[i] = 'putting'
                until[i] = now + time[i][3]
            elif status[i] == 'putting' and until[i] <= now:
                status[i] = 'right'
                delivered += 1
                last_put = until[i]
            elif status[i] == 'crossing_left' and until[i] <= now:
                status[i] = 'left'
        if bridge_until <= now:
            back = [i for i in range(k) if status[i] == 'right']
            ready = [i for i in range(k) if status[i] == 'ready']
            if back and left_boxes > 0:
                i = min(back)
                status[i] = 'crossing_left'
                until[i] = now + time[i][2]
                bridge_until = until[i]
            elif ready:
                i = max(ready, key=lambda j: (time[j][0] + time[j][2], -j))
                status[i] = 'crossing_right'
                until[i] = now + time[i][0]
                bridge_until = until[i]
        for i in range(k):
            if status[i] == 'left' and left_boxes > 0:
                left_boxes -= 1
                status[i] = 'picking'
                until[i] = now + time[i][1]
        future = [until[i] for i in range(k) if status[i] in ('picking', 'crossing_right', 'putting', 'crossing_left') and until[i] > now]
        if bridge_until > now:
            future.append(bridge_until)
        if not future:
            break
        now = min(future)
    return last_put
`

const PY = { start: 4, loop: 9, backLeft: 26, right: 32, jump: 40, done: 46 }

export function parse(text) {
  const input = JSON.parse(text)
  if (!Number.isInteger(input?.n) || input.n < 1 || input.n > 6) throw new Error('n is an integer from 1 to 6.')
  if (!Number.isInteger(input.k) || input.k < 1 || input.k > 4) throw new Error('k is an integer from 1 to 4.')
  if (!Array.isArray(input.time) || input.time.length !== input.k || !input.time.every(t => Array.isArray(t) && t.length === 4 && t.every(v => Number.isInteger(v) && v >= 1 && v <= 9))) throw new Error('time has k rows of four integers from 1 to 9: [to right, pick, to left, put].')
  return { n: input.n, k: input.k, time: input.time }
}

export function build({ n, k, time }) {
  let leftBoxes = n, delivered = 0, now = 0, bridgeUntil = 0, lastPut = 0
  const status = Array(k).fill('left')
  const until = Array(k).fill(0)
  const frames = []
  const snap = (phase, line, pyLine, message) => frames.push({
    phase, activeLine: line, pythonLine: pyLine, message, now, status: [...status], until: [...until],
    leftBoxes, delivered, bridgeBusy: bridgeUntil > now,
  })
  snap('start', 1, PY.start, `${n} boxes wait on the left; ${k} workers start there.`)
  let guard = 0
  while (delivered < n && guard++ < 500) {
    snap('loop', 2, PY.loop, `At time ${now}: ${delivered} of ${n} boxes delivered.`)
    for (let i = 0; i < k; i++) {
      if (status[i] === 'picking' && until[i] <= now) status[i] = 'ready'
      else if (status[i] === 'crossing_right' && until[i] <= now) { status[i] = 'putting'; until[i] = now + time[i][3] }
      else if (status[i] === 'putting' && until[i] <= now) { status[i] = 'right'; delivered += 1; lastPut = until[i] }
      else if (status[i] === 'crossing_left' && until[i] <= now) status[i] = 'left'
    }
    if (bridgeUntil <= now) {
      const back = status.map((s, i) => (s === 'right' ? i : -1)).filter(i => i >= 0)
      const ready = status.map((s, i) => (s === 'ready' ? i : -1)).filter(i => i >= 0)
      if (back.length && leftBoxes > 0) {
        const i = Math.min(...back)
        status[i] = 'crossing_left'
        until[i] = now + time[i][2]
        bridgeUntil = until[i]
        snap('backLeft', 4, PY.backLeft, `Worker ${i} crosses back to the left to pick another box.`)
      } else if (ready.length) {
        const i = ready.reduce((best, j) => {
          const a = time[j][0] + time[j][2], b = time[best][0] + time[best][2]
          return a > b || (a === b && j < best) ? j : best
        })
        status[i] = 'crossing_right'
        until[i] = now + time[i][0]
        bridgeUntil = until[i]
        snap('right', 5, PY.right, `Worker ${i} carries a box across to the right.`)
      }
    }
    for (let i = 0; i < k; i++) {
      if (status[i] === 'left' && leftBoxes > 0) {
        leftBoxes -= 1
        status[i] = 'picking'
        until[i] = now + time[i][1]
      }
    }
    const future = []
    for (let i = 0; i < k; i++) if (['picking', 'crossing_right', 'putting', 'crossing_left'].includes(status[i]) && until[i] > now) future.push(until[i])
    if (bridgeUntil > now) future.push(bridgeUntil)
    snap('jump', 7, PY.jump, 'Advance the clock to the next finishing action.')
    if (!future.length) break
    now = Math.min(...future)
  }
  snap('done', 8, PY.done, `The last box is put down at time ${lastPut}.`)
  return { input: { n, k, time }, result: lastPut, frames }
}

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Everyone on the left.' },
    { id: 'loop', label: 'Tick', description: 'Finish actions due now.' },
    { id: 'backLeft', label: 'Return', description: 'A right-side worker crosses to pick more.' },
    { id: 'right', label: 'Carry', description: 'A ready worker crosses with a box.' },
    { id: 'jump', label: 'Jump', description: 'Move to the next event.' },
    { id: 'done', label: 'Result', description: 'Last box put down.' },
  ],
  parse, build, code, python,
  inputLabel: 'Object with n (boxes), k (workers) and time (k rows of [to right, pick, to left, put])',
  url: 'https://leetcode.com/problems/time-to-cross-a-bridge/',
  complexity: 'Each event is handled once; with heaps the class version runs in O((n + k) log k). The visualization scans the k workers per event and is capped at 6 boxes and 4 workers.',
  examples: [
    { label: 'Example', input: '{"n":3,"k":2,"time":[[1,2,3,4],[2,1,1,2]]}' },
    { label: 'One worker', input: '{"n":2,"k":1,"time":[[2,1,2,1]]}' },
  ],
}

export default function TimeToCrossABridge() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Workers">
      <thead><tr><th>Worker</th><th>State</th><th>Ready at</th></tr></thead>
      <tbody>{step.status.map((s, i) => <tr key={i} data-state={s}><td>{i}</td><td>{s}</td><td>{step.until[i]}</td></tr>)}</tbody>
    </table>
    <output aria-label="Simulation state">{`Time ${step.now} · boxes left to pick ${step.leftBoxes} · delivered ${step.delivered} of ${run.input.n} · bridge ${step.bridgeBusy ? 'busy' : 'free'}`}</output>
  </>} renderReasoning={() => <>
    <p>The bridge is the only shared resource, so the simulation jumps from one finishing time to the next. When the bridge frees up, a worker who must pick more boxes returns first; otherwise the most efficient worker carrying a box goes across.</p>
    <p>The answer is the time the last put action finishes.</p>
  </>} />
}
