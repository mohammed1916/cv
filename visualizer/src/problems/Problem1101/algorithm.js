// Own union-find walkthrough. The sample logs are invented for this visualization.
const CODE_TEXT = `function earliestFullLink(n, logs) {
  const sorted = [...logs].sort((x, y) => x[0] - y[0])
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = x => { while (parent[x] !== x) x = parent[x]; return x }
  let groups = n
  for (const [time, a, b] of sorted) {
    const ra = find(a)
    const rb = find(b)
    if (ra !== rb) {
      parent[ra] = rb
      groups--
    }
    if (groups === 1) return time
  }
  return -1
}`

export const python = `def earliest_full_link(n, logs):
    logs = sorted(logs)
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    groups = n
    for time, a, b in logs:
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb
            groups -= 1
        if groups == 1:
            return time
    return -1`

const PY = python.split('\n')
export const code = CODE_TEXT.split('\n').map((text, index) => ({ line: index + 1, text }))

const STEP = {
  start: ['const parent = Array.from', 'parent = list('],
  pick: ['for (const [time, a, b]', 'for time, a, b'],
  find: ['const ra = find(a)', 'ra, rb = find'],
  merge: ['parent[ra] = rb', 'parent[ra] = rb'],
  skip: ['if (ra !== rb)', 'if ra != rb'],
  done: ['return time', 'return time'],
  none: ['return -1', 'return -1'],
}
function lineOf(lines, key) {
  const index = lines.findIndex(line => line.includes(key))
  if (index < 0) throw new Error(`Missing line: ${key}`)
  return index + 1
}
const frame = (phase, step, message, snapshot) => ({
  phase,
  activeLine: lineOf(CODE_TEXT.split('\n'), STEP[step][0]),
  pythonLine: lineOf(PY, STEP[step][1]),
  message,
  snapshot,
})

export const phases = [
  { id: 'start', label: 'Start', description: 'Every person begins as a separate group.' },
  { id: 'inspect', label: 'Inspect', description: 'Find the group of each person in the next log.' },
  { id: 'update', label: 'Merge', description: 'Join two different groups and reduce the group count.' },
  { id: 'done', label: 'Result', description: 'The first time one group remains is the answer.' },
]

export const inputLabel = 'JSON with n and logs as [time, a, b] triples, e.g. {"n":3,"logs":[[5,0,1],[2,1,2]]}'
export const complexity = 'O(m log m + m α(n)) time for sorting and union-find operations, where m is the number of logs. The visualizer accepts up to 8 people and 12 logs.'
export const examples = [
  { label: 'Sample', input: '{"n":4,"logs":[[30,0,1],[10,2,3],[50,1,2],[70,0,3]]}' },
  { label: 'Isolated person', input: '{"n":3,"logs":[[1,0,1],[2,0,1]]}' },
  { label: 'Two people', input: '{"n":2,"logs":[[9,1,0]]}' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Number.isInteger(input.n) || !Array.isArray(input.logs)) throw new Error('Use {"n":people,"logs":[[time,a,b],...]}.')
  if (input.n < 2 || input.n > 8) throw new Error('Use 2 to 8 people for the visualization.')
  if (input.logs.length > 12) throw new Error('Use at most 12 logs.')
  const logs = input.logs.map(log => {
    if (!Array.isArray(log) || log.length !== 3 || !log.every(Number.isInteger)) throw new Error('Each log must be [time, a, b] with integers.')
    const [time, a, b] = log
    if (time < 0 || time > 1000000) throw new Error('Times must be from 0 to 1000000.')
    if (a < 0 || b < 0 || a >= input.n || b >= input.n) throw new Error('People are numbered from 0 to n-1.')
    if (a === b) throw new Error('A log must connect two different people.')
    return [time, a, b]
  })
  return { n: input.n, logs }
}

export function buildTrace(input) {
  const { n } = input
  const logs = [...input.logs].sort((x, y) => x[0] - y[0])
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = x => { while (parent[x] !== x) x = parent[x]; return x }
  let groups = n
  const groupsOf = () => {
    const members = new Map()
    for (let i = 0; i < n; i++) {
      const root = find(i)
      if (!members.has(root)) members.set(root, [])
      members.get(root).push(i)
    }
    return [...members.values()]
  }
  const snap = extra => ({ n, groups, parent: [...parent], clusters: groupsOf(), ...extra })
  const frames = [frame('start', 'start', `${n} people start in ${n} separate groups.`, snap())]
  let result = -1
  for (const [time, a, b] of logs) {
    const ra = find(a)
    const rb = find(b)
    frames.push(frame('inspect', 'find', `At time ${time}, person ${a} is in group ${ra} and person ${b} is in group ${rb}.`, snap({ time, a, b })))
    if (ra !== rb) {
      parent[ra] = rb
      groups -= 1
      frames.push(frame('update', 'merge', `Merge the two groups. ${groups} group${groups === 1 ? '' : 's'} remain.`, snap({ time, a, b })))
    } else {
      frames.push(frame('inspect', 'skip', `They are already together; this friendship changes nothing.`, snap({ time, a, b })))
    }
    if (groups === 1) {
      result = time
      frames.push(frame('done', 'done', `One group remains at time ${time}; that is the earliest answer.`, snap({ time })))
      return { input, result, frames }
    }
  }
  frames.push(frame('done', 'none', 'Logs end with more than one group, so return -1.', snap()))
  return { input, result, frames }
}
