export function parseInput(text) {
  const count = JSON.parse(text)
  if (!Array.isArray(count) || count.length !== 256) throw new Error('Use an array of exactly 256 counts, one for each value 0 to 255.')
  if (count.some(v => !Number.isInteger(v) || v < 0 || v > 60)) throw new Error('Each count is an integer from 0 to 60 for this visualization.')
  const total = count.reduce((a, b) => a + b, 0)
  if (total < 1 || total > 200) throw new Error('Use between 1 and 200 samples in total.')
  const top = Math.max(...count)
  if (count.filter(v => v === top).length !== 1) throw new Error('The mode must be unique.')
  return count
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function sampleStatistics(count) {', 'def sample_statistics(count):'],
  ['  const total = count.reduce((a, b) => a + b, 0)', '    total = sum(count)'],
  ['  let low = null', '    low = None'],
  ['  let high = null', '    high = None'],
  ['  let weighted = 0', '    weighted = 0'],
  ['  let mode = 0, best = -1', '    mode, best = None, -1'],
  ['  for (let v = 0; v < 256; v++) {', '    for v in range(256):'],
  ['    const c = count[v]', '        c = count[v]'],
  ['    if (c === 0) continue', '        if c == 0: continue'],
  ['    if (low === null) low = v', '        if low is None: low = v'],
  ['    high = v', '        high = v'],
  ['    weighted += v * c', '        weighted += v * c'],
  ['    if (c > best) { best = c; mode = v }', '        if c > best: best, mode = c, v'],
  ['  }', ''],
  ['  const mean = weighted / total', '    mean = weighted / total'],
  ['  const at = k => {', '    def at(k):'],
  ['    let seen = 0', '        seen = 0'],
  ['    for (let v = 0; v < 256; v++) {', '        for v in range(256):'],
  ['      seen += count[v]', '            seen += count[v]'],
  ['      if (seen > k) return v', '            if seen > k: return v'],
  ['    }', ''],
  ['    return -1', '        return -1'],
  ['  }', ''],
  ['  const median = total % 2 === 1 ? at((total - 1) / 2) : (at(total / 2 - 1) + at(total / 2)) / 2', '    median = at((total - 1) // 2) if total % 2 == 1 else (at(total // 2 - 1) + at(total // 2)) / 2'],
  ['  return [low, high, mean, median, mode]', '    return [low, high, mean, median, mode]'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(count) {
  const total = count.reduce((a, b) => a + b, 0)
  // The sample at sorted position k: walk the counts until more than k samples have been seen.
  const at = k => { let seen = 0; for (let v = 0; v < 256; v++) { seen += count[v]; if (seen > k) return v } return -1 }
  let low = null, high = null, weighted = 0, mode = 0, best = -1
  const frames = [{ pythonLine: P('total = sum'), phase: 'start', activeLine: L('const total'), value: null, message: `There are ${total} samples. Scan the values from 0 to 255.` }]
  for (let v = 0; v < 256; v++) {
    const c = count[v]
    if (c === 0) continue
    if (low === null) low = v
    high = v
    weighted += v * c
    if (c > best) { best = c; mode = v }
    frames.push({ pythonLine: P('weighted += v * c'), phase: 'scan', activeLine: L('weighted += v * c'), value: v, message: `${c} sample(s) of ${v}. Running sum ${weighted}, smallest ${low}, largest ${high}, mode ${mode}.` })
  }
  const mean = weighted / total
  const median = total % 2 === 1 ? at((total - 1) / 2) : (at(total / 2 - 1) + at(total / 2)) / 2
  const result = [low, high, mean, median, mode]
  frames.push({ pythonLine: P('median = at'), phase: 'median', activeLine: L('const median'), value: null, message: `Mean is ${mean}. The middle sample gives median ${median}.` })
  frames.push({ pythonLine: P('return [low'), phase: 'done', activeLine: L('return [low, high'), value: null, message: `Statistics: [${result.join(', ')}].` })
  return { input: count, result, frames }
}
