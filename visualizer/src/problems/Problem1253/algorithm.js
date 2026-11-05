export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) throw new Error('Use an object with keys upper, lower and colsum.')
  const { upper, lower, colsum } = obj
  if (!Number.isInteger(upper) || !Number.isInteger(lower) || upper < 0 || lower < 0 || upper > 20 || lower > 20) throw new Error('upper and lower are integers from 0 to 20.')
  if (!Array.isArray(colsum) || colsum.length < 1 || colsum.length > 20) throw new Error('colsum is an array of 1 to 20 entries.')
  if (colsum.some(v => v !== 0 && v !== 1 && v !== 2)) throw new Error('Each colsum entry is 0, 1 or 2.')
  return { upper, lower, colsum }
}

// Each line of JavaScript is paired with the Python line on the same row.
const LINES = [
  ['function reconstructMatrix(upper, lower, colsum) {', 'def reconstruct_matrix(upper, lower, colsum):'],
  ['  const twos = colsum.filter(v => v === 2).length', '    twos = sum(1 for total in colsum if total == 2)'],
  ['  let upRemaining = upper - twos', '    up_remaining = upper - twos'],
  ['  let lowRemaining = lower - twos', '    low_remaining = lower - twos'],
  ['  const top = []', '    top = []'],
  ['  const bottom = []', '    bottom = []'],
  ['  for (const total of colsum) {', '    for total in colsum:'],
  ['    if (total === 2) {', '        if total == 2:'],
  ['      top.push(1)', '            top.append(1)'],
  ['      bottom.push(1)', '            bottom.append(1)'],
  ['    } else if (total === 0) {', '        elif total == 0:'],
  ['      top.push(0)', '            top.append(0)'],
  ['      bottom.push(0)', '            bottom.append(0)'],
  ['    } else if (upRemaining > 0) {', '        elif up_remaining > 0:'],
  ['      top.push(1)', '            top.append(1)'],
  ['      bottom.push(0)', '            bottom.append(0)'],
  ['      upRemaining--', '            up_remaining -= 1'],
  ['    } else {', '        else:'],
  ['      top.push(0)', '            top.append(0)'],
  ['      bottom.push(1)', '            bottom.append(1)'],
  ['      lowRemaining--', '            low_remaining -= 1'],
  ['    }', ''],
  ['  }', ''],
  ['  if (upRemaining === 0 && lowRemaining === 0) return [top, bottom]', '    if up_remaining == 0 and low_remaining == 0:'],
  ['    return [top, bottom]', '        return [top, bottom]'],
  ['  return []', '    return []'],
  ['}', ''],
]
const codeLines = LINES.map(([js]) => js)
export const code = codeLines.map((text, index) => ({ line: index + 1, text }))
const L = s => codeLines.findIndex(c => c.includes(s)) + 1
export const python = LINES.map(([, py]) => py).join('\n')
const P = s => python.split('\n').findIndex(l => l.includes(s)) + 1

export function buildTrace(input) {
  const { upper, lower, colsum } = input
  const pyLine = { both: P('if total == 2:'), none: P('elif total == 0:'), top: P('elif up_remaining > 0:'), bottom: P('else:') }
  const top = []
  const bottom = []
  const placed = colsum.map(() => '')
  const twos = colsum.filter(v => v === 2).length
  let up = upper - twos
  let low = lower - twos
  const frames = [{ phase: 'start', activeLine: L('let upRemaining'), pythonLine: P('up_remaining = upper - twos'), index: -1, placed: [...placed], up, low, message: `Columns with sum 2 use one 1 from each row, leaving ${up} for the top row and ${low} for the bottom row.` }]
  colsum.forEach((total, j) => {
    let label
    if (total === 2) { top.push(1); bottom.push(1); label = 'both' }
    else if (total === 0) { top.push(0); bottom.push(0); label = 'none' }
    else if (up > 0) { top.push(1); bottom.push(0); up -= 1; label = 'top' }
    else { top.push(0); bottom.push(1); low -= 1; label = 'bottom' }
    placed[j] = label
    const activeLine = { both: L('if (total === 2)'), none: L('else if (total === 0)'), top: L('else if (upRemaining > 0)'), bottom: L('} else {') }[label]
    const text = { both: 'a 1 in both rows', none: 'zeros in both rows', top: 'its 1 in the top row', bottom: 'its 1 in the bottom row' }[label]
    frames.push({ phase: 'column', activeLine, pythonLine: pyLine[label], index: j, placed: [...placed], up, low, message: `Column ${j} has sum ${total}, so it gets ${text}.` })
  })
  const ok = up === 0 && low === 0
  const result = ok ? [top, bottom] : []
  frames.push({ phase: 'done', activeLine: L(ok ? 'return [top, bottom]' : 'return []'), pythonLine: P(ok ? 'return [top, bottom]' : 'return []'), index: -1, placed: [...placed], up, low, message: ok ? 'Both row sums and every column sum are met.' : 'A row quota is left unfilled, so no matrix fits.' })
  return { input, result, frames }
}
