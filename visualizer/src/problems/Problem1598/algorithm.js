// Crawler log folder: the answer is the depth of the folder after all operations.
const JS_LINES = [
  { text: 'let depth = 0', py: 'depth = 0' },
  { text: 'for (const log of logs) {', py: 'for log in logs' },
  { text: 'if (log === "../") depth = Math.max(0, depth - 1)', py: "if log == '../'" },
  { text: 'else if (log === "./") continue', py: "elif log == './'" },
  { text: 'else depth++', py: 'depth += 1' },
  { text: '}', py: null },
  { text: 'return depth', py: 'return depth' },
]

export const code = JS_LINES.map(({ text }, i) => ({ line: i + 1, text }))

export const python = `def minOperations(logs):
    depth = 0
    for log in logs:
        if log == '../':
            depth = max(0, depth - 1)
        elif log == './':
            continue
        else:
            depth += 1
    return depth
`

const PY = python.split('\n')
const pyAt = needle => {
  const index = PY.findIndex(line => line.includes(needle))
  if (index < 0) throw new Error(`python line missing: ${needle}`)
  return index + 1
}
export const pythonLineMap = Object.fromEntries(JS_LINES.map((line, i) => [i + 1, pyAt(line.py ?? 'return depth')]))

export const phases = [
  { id: 'start', label: 'Start', description: 'The user starts in the main folder, which has depth 0.' },
  { id: 'move', label: 'Move', description: 'Each operation changes depth, stays, or steps back toward the main folder.' },
  { id: 'done', label: 'Result', description: 'The depth after all operations is the number of steps back to the main folder.' },
]

export const examples = [
  { label: 'Back and forth', input: '["m1/","n2/","./","m3/","../","x9/","../","../"]' },
  { label: 'Stay and enter', input: '["a/","../","../","b/"]' },
  { label: 'Already at root', input: '["k1/","k2/","../","../","../"]' },
]

export const complexity = 'O(n) time and O(1) space for n log entries.'

export function parseInput(text) {
  const logs = JSON.parse(text)
  if (!Array.isArray(logs) || logs.length < 1 || logs.length > 1000) throw new Error('Use a JSON array of 1 to 1000 log entries.')
  for (const entry of logs) {
    if (typeof entry !== 'string' || entry.length < 2 || entry.length > 10) throw new Error('Each entry is 2 to 10 characters long.')
    if (entry !== '../' && entry !== './' && !/^[a-z0-9]+\/$/.test(entry)) throw new Error(`Bad log entry: ${entry}`)
  }
  return logs
}

export function buildTrace(logs) {
  const frames = []
  let depth = 0
  const snap = extra => ({ depth, ...extra })
  frames.push({ phase: 'start', activeLine: 1, index: -1, message: 'Start in the main folder, depth 0.', snapshot: snap({}) })
  logs.forEach((log, i) => {
    let kind
    let line
    if (log === '../') {
      depth = Math.max(0, depth - 1); kind = 'up'; line = 3
    } else if (log === './') {
      kind = 'stay'; line = 4
    } else {
      depth++; kind = 'down'; line = 5
    }
    const message = kind === 'up' ? `"../" moves up; depth ${depth}.` : kind === 'stay' ? '"./" leaves the depth unchanged.' : `"${log}" enters a child; depth ${depth}.`
    frames.push({ phase: 'move', activeLine: line, index: i, kind, message, snapshot: snap({ operation: log }) })
  })
  frames.push({ phase: 'done', activeLine: 7, index: -1, result: depth, message: `${depth} step${depth === 1 ? '' : 's'} back to the main folder.`, snapshot: snap({ result: depth }) })
  return { input: logs, result: depth, frames }
}
