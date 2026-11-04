const UNITS = ['Year', 'Month', 'Day', 'Hour', 'Minute', 'Second']
const STAMP = /^\d{4}(:\d{2}){5}$/

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || !Array.isArray(input.ops) || input.ops.length < 1 || input.ops.length > 20) throw new Error('Use an object with ops, 1 to 20 operations.')
  for (const op of input.ops) {
    if (op[0] === 'put' && Number.isInteger(op[1]) && typeof op[2] === 'string' && STAMP.test(op[2])) continue
    if (op[0] === 'retrieve' && typeof op[1] === 'string' && typeof op[2] === 'string' && STAMP.test(op[1]) && STAMP.test(op[2]) && UNITS.includes(op[3])) continue
    throw new Error('Use put [id, "YYYY:MM:DD:HH:MM:SS"] or retrieve [start, end, granularity].')
  }
  return input
}

const cut = (stamp, idx) => stamp.split(':').slice(0, idx + 1).join(':')

export function buildTrace({ ops }) {
  const logs = []
  const frames = []
  const state = () => logs.map(([id, ts]) => `log ${id} at ${ts}`)
  let matched = []
  frames.push({ phase: 'start', pythonLine: PL('logs = []'), activeLine: L('start with no logs'), state: [], logs: [], window: null, matched: [], message: 'No logs are stored yet.' })
  for (const op of ops) {
    if (op[0] === 'put') {
      logs.push([op[1], op[2]])
      frames.push({ phase: 'put', pythonLine: PL('logs.append'), activeLine: L('append its id'), state: state(), logs: logs.map(([id, ts]) => [id, ts]), window: null, matched: [], message: `Store log ${op[1]} at ${op[2]}.` })
      continue
    }
    const [, start, end, gran] = op
    const idx = UNITS.indexOf(gran)
    matched = logs.filter(([, ts]) => cut(ts, idx) >= cut(start, idx) && cut(ts, idx) <= cut(end, idx)).map(([id]) => id).sort((a, b) => a - b)
    frames.push({ phase: 'retrieve', pythonLine: PL('result = sorted'), activeLine: L('keep the ids whose'), state: [...state(), `matched: ${matched.join(', ') || 'none'}`], logs: logs.map(([id, ts]) => [id, ts]), window: { start, end, gran }, matched: [...matched], message: `Compare every stamp down to ${gran}: ${matched.length} match${matched.length === 1 ? '' : 'es'}.` })
  }
  frames.push({ phase: 'done', pythonLine: PL('return result'), activeLine: L('return the last matched'), state: [...state(), `last result: ${matched.join(', ') || 'none'}`], logs: logs.map(([id, ts]) => [id, ts]), window: null, matched: [...matched], message: 'All operations are finished.' })
  return { input: { ops }, result: matched, frames }
}

export const code = `log storage with granularity-aware retrieve
  start with no logs
  for each operation in order
    if the operation stores a log then append its id and stamp
    otherwise cut the start, end and every stamp to the granularity
      keep the ids whose cut stamp lies between the cut bounds
  return the last matched ids`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `UNITS = ["Year", "Month", "Day", "Hour", "Minute", "Second"]

def cut(stamp, idx):
    return ":".join(stamp.split(":")[: idx + 1])

def retrieve_logs(ops):
    logs = []
    result = []
    for op in ops:
        if op[0] == "put":
            logs.append((op[1], op[2]))
            continue
        start, end, gran = op[1], op[2], op[3]
        idx = UNITS.index(gran)
        lo = cut(start, idx)
        hi = cut(end, idx)
        result = sorted(i for i, ts in logs if lo <= cut(ts, idx) <= hi)
    return result
`
const PL = s => python.split('\n').findIndex(l => l.includes(s)) + 1
