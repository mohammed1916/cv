export function parseInput(text) {
  const input = JSON.parse(text)
  const arr = input?.arr
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 12) throw new Error('Use {"arr": [...]} with 1 to 12 integers.')
  if (arr.some(v => !Number.isInteger(v) || v < -1000 || v > 1000)) throw new Error('Values are integers from -1000 to 1000.')
  return { arr }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function minJumps(arr) {', 'def min_jumps(arr):'],
  ['  const n = arr.length', '    n = len(arr)'],
  ['  if (n === 1) return 0', '    if n == 1:'],
  ['  // a single element needs no jump', '        return 0'],
  ['  const byValue = new Map()', '    by_value = {}'],
  ['  for (let i = 0; i < n; i++) {', '    for i, v in enumerate(arr):'],
  ['    if (!byValue.has(arr[i])) byValue.set(arr[i], [])', '        by_value.setdefault(v, [])'],
  ['    byValue.get(arr[i]).push(i)', '        by_value[v].append(i)'],
  ['  }', ''],
  ['  const dist = Array(n).fill(-1)', '    dist = [-1] * n'],
  ['  dist[0] = 0', '    dist[0] = 0'],
  ['  const queue = [0]', '    queue = [0]'],
  ['  let head = 0', '    head = 0'],
  ['  while (head < queue.length) {', '    while head < len(queue):'],
  ['    const i = queue[head]', '        i = queue[head]'],
  ['    head++', '        head += 1'],
  ['    if (i === n - 1) return dist[i]', '        if i == n - 1: return dist[i]'],
  ['    for (const j of [i - 1, i + 1, ...(byValue.get(arr[i]) ?? [])]) {', '        for j in [i - 1, i + 1] + by_value.get(arr[i], []):'],
  ['      if (j >= 0 && j < n && dist[j] === -1) {', '            if 0 <= j < n and dist[j] == -1:'],
  ['        dist[j] = dist[i] + 1', '                dist[j] = dist[i] + 1'],
  ['        queue.push(j)', '                queue.append(j)'],
  ['      }', ''],
  ['    }', ''],
  ['    byValue.set(arr[i], [])', '        by_value[arr[i]] = []'],
  ['  }', ''],
  ['  return -1', '    return -1'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(input) {
  const { arr } = input
  const n = arr.length
  if (n === 1) {
    return { input, result: 0, frames: [{ phase: 'done', activeLine: L('if (n === 1)'), pythonLine: P('if n == 1'), current: 0, frontier: [], visited: [0], jumps: 0, message: 'One element: no jump is needed.' }] }
  }
  const byValue = new Map()
  arr.forEach((v, i) => {
    if (!byValue.has(v)) byValue.set(v, [])
    byValue.get(v).push(i)
  })
  const dist = Array(n).fill(-1)
  dist[0] = 0
  const queue = [0]
  const frames = [{ phase: 'start', activeLine: L('const queue = [0]'), pythonLine: P('queue = [0]'), current: 0, frontier: [0], visited: [0], jumps: 0, message: 'Start at index 0.' }]
  let answer = -1
  for (let head = 0; head < queue.length; head++) {
    const i = queue[head]
    if (i === n - 1) {
      answer = dist[i]
      frames.push({ phase: 'found', activeLine: L('if (i === n - 1)'), pythonLine: P('if i == n - 1'), current: i, frontier: queue.slice(head + 1), visited: queue.slice(0, head + 1), jumps: answer, message: `Reached the last index after ${answer} jump(s).` })
      break
    }
    const sameValue = byValue.get(arr[i]) ?? []
    const candidates = [i - 1, i + 1, ...sameValue]
    frames.push({ phase: 'pop', activeLine: L('for (const j of'), pythonLine: P('for j in [i - 1'), current: i, frontier: queue.slice(head + 1), visited: [...queue.slice(0, head + 1)], jumps: dist[i], message: `At index ${i} (value ${arr[i]}), ${sameValue.length} index(es) share its value.` })
    for (const j of candidates) {
      if (j >= 0 && j < n && dist[j] === -1) {
        dist[j] = dist[i] + 1
        queue.push(j)
      }
    }
    byValue.set(arr[i], [])
  }
  if (answer === -1) frames.push({ phase: 'done', activeLine: L('return -1'), pythonLine: P('return -1'), current: null, frontier: [], visited: [...queue], jumps: null, message: 'The last index cannot be reached: -1.' })
  else frames.push({ phase: 'done', activeLine: L('if (i === n - 1) return dist[i]'), pythonLine: P('if i == n - 1: return dist[i]'), current: null, frontier: [], visited: [...queue], jumps: answer, message: `Minimum jumps: ${answer}.` })
  return { input, result: answer, frames }
}
