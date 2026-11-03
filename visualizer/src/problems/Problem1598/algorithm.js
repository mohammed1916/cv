export const phases = [
  { id: 'start', label: 'Main folder', description: 'Start at depth 0, the main folder.' },
  { id: 'enter', label: 'Enter folder', description: 'A folder name adds one level of depth.' },
  { id: 'up', label: 'Go to parent', description: 'Step to the parent; at the main folder, the move is ignored.' },
  { id: 'stay', label: 'Stay here', description: 'A same-folder marker changes nothing.' },
  { id: 'done', label: 'Return', description: 'Return the depth after every log.' },
]

export const complexity = 'O(k) time for k log entries. O(1) extra space: only the current depth is stored.'

export const examples = [
  { label: 'Mixed', input: '["alpha/","beta/","../","./","gamma/","../","../","../"]' },
  { label: 'Stuck at top', input: '["../","../","x/"]' },
  { label: 'Idle', input: '["./","./"]' },
]

const TOKEN = /^([a-z]+\/|\.\/|\.\.\/)$/

export function parseInput(text) {
  let logs
  try {
    logs = JSON.parse(text)
  } catch {
    throw new Error('Enter a JSON array of log strings such as ["a/","../"].')
  }
  if (!Array.isArray(logs) || logs.length < 1 || logs.length > 50 || !logs.every(v => typeof v === 'string' && TOKEN.test(v))) {
    throw new Error('Use 1 to 50 entries, each "name/", "../" or "./".')
  }
  return [...logs]
}

export function buildTrace(logs) {
  let depth = 0
  const frames = []
  const snap = (index, log) => ({ index, log: log ?? null, depth })
  frames.push({ phase: 'start', activeLine: 2, message: 'Start at the main folder, depth 0.', snapshot: snap(-1) })
  logs.forEach((log, index) => {
    if (log === '../') {
      depth = Math.max(0, depth - 1)
      frames.push({ phase: 'up', activeLine: 4, message: depth === 0 && log === '../' ? '"../" at the main folder stays at depth 0.' : `"../" moves up to depth ${depth}.`, snapshot: snap(index, log) })
    } else if (log === './') {
      frames.push({ phase: 'stay', activeLine: 5, message: '"./" keeps the current folder.', snapshot: snap(index, log) })
    } else {
      depth += 1
      frames.push({ phase: 'enter', activeLine: 5, message: `Enter "${log}", depth ${depth}.`, snapshot: snap(index, log) })
    }
  })
  frames.push({ phase: 'done', activeLine: 6, message: `Return depth ${depth}.`, snapshot: snap(logs.length - 1) })
  return { input: logs, result: depth, frames }
}

export const python = `def finalDepth(logs):
    depth = 0
    for log in logs:
        if log == "../":
            depth = max(0, depth - 1)
        elif log != "./":
            depth += 1
    return depth`

export const code = [
  'FUNCTION finalDepth(logs)',
  '    depth = 0',
  '    FOR each log in logs',
  '        IF log is "../" THEN depth = max(0, depth - 1)',
  '        ELSE IF log is not "./" THEN depth += 1',
  '    RETURN depth',
].map((text, index) => ({ line: index + 1, text }))

// Pseudocode line -> Python line.
export const pythonLineMap = { 1: 1, 2: 2, 3: 3, 4: 5, 5: 7, 6: 8 }
