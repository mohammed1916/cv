export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with workers and stations.')
  const { workers, stations } = input
  if (typeof workers !== 'string' || workers.length < 1 || workers.length > 8 || !/^[a-z]+$/.test(workers)) throw new Error('workers is 1 to 8 lowercase letters.')
  if (typeof stations !== 'string' || stations.length < workers.length || stations.length > 16 || !/^[a-z]+$/.test(stations)) throw new Error('stations is 1 to 16 lowercase letters, at least as many as workers.')
  let pos = 0
  for (const ch of workers) {
    pos = stations.indexOf(ch, pos)
    if (pos < 0) throw new Error('No complete assignment exists for these strings.')
    pos += 1
  }
  return { workers, stations }
}

const lineOf = (list, text) => {
  const i = list.findIndex(c => c.text.includes(text))
  if (i < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return i + 1
}

export function buildTrace({ workers, stations }) {
  const frames = []
  const L = t => lineOf(code, t)
  const P = t => lineOf(PY, t)
  const n = workers.length
  const earliest = []
  const latest = Array(n).fill(-1)
  let pos = -1
  for (let i = 0; i < n; i++) {
    pos = stations.indexOf(workers[i], pos + 1)
    earliest.push(pos)
    frames.push({ phase: 'earliest', activeLine: L('earliest[i] = the first'), pythonLine: P('earliest.append(pos)'), workers, stations, earliest: [...earliest], latest: latest.map((v, k) => (k < i ? -1 : v)), i, from: null, to: null, gap: null, best: 0, message: `Worker ${i + 1} (${workers[i]}) is placed as early as possible at station ${pos}.` })
  }
  let end = stations.length
  for (let i = n - 1; i >= 0; i--) {
    end = stations.lastIndexOf(workers[i], end - 1)
    latest[i] = end
    frames.push({ phase: 'latest', activeLine: L('latest[i] = the last'), pythonLine: P('latest[i] = pos'), workers, stations, earliest: [...earliest], latest: [...latest], i, from: null, to: null, gap: null, best: 0, message: `Worker ${i + 1} (${workers[i]}) is placed as late as possible at station ${end}.` })
  }
  let best = 0
  for (let i = 0; i + 1 < n; i++) {
    const from = earliest[i]
    const to = latest[i + 1]
    const valid = to > from
    const gap = valid ? to - from : null
    if (valid) best = Math.max(best, gap)
    frames.push({ phase: valid ? 'pair' : 'skip', activeLine: L('if latest[i + 1] is greater'), pythonLine: P('if latest[i + 1] > earliest[i]'), workers, stations, earliest: [...earliest], latest: [...latest], i, from, to, gap, best, message: valid ? `Workers ${i + 1} and ${i + 2}: stations ${from} to ${to} give a gap of ${gap}.` : `Workers ${i + 1} and ${i + 2} cannot fit in that order, so this pair is skipped.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: P('return best'), workers, stations, earliest: [...earliest], latest: [...latest], i: -1, from: null, to: null, gap: null, best, result: best, message: `The largest gap between consecutive assigned workers is ${best}.` })
  return { input: { workers, stations }, result: best, frames }
}

export const code = `largest index gap between consecutive assigned workers
earliest[i] = the first station that can take worker i, scanning left to right
latest[i] = the last station that can take worker i, scanning right to left
best = 0
for each consecutive pair of workers i and i plus 1
  if latest[i + 1] is greater than earliest[i] then best = max(best, latest[i + 1] minus earliest[i])
return best`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def maximum_station_gap(workers, stations):
    n = len(workers)
    earliest = []
    pos = -1
    for w in workers:
        pos = stations.index(w, pos + 1)
        earliest.append(pos)
    latest = [0] * n
    pos = len(stations)
    for i in range(n - 1, -1, -1):
        pos = stations.rindex(workers[i], 0, pos)
        latest[i] = pos
    best = 0
    for i in range(n - 1):
        if latest[i + 1] > earliest[i]:
            best = max(best, latest[i + 1] - earliest[i])
    return best
`
const PY = python.split('\n').map((text, index) => ({ line: index + 1, text }))
