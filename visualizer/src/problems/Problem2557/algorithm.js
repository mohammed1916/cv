const CODE = [
  'function maxNumbers(banned, n, maxSum) {',
  '  const forbidden = [...new Set(banned.filter(x => x >= 1 && x <= n))].sort((a, b) => a - b)',
  '  let total = 0, count = 0, lo = 1',
  '  for (const f of [...forbidden, n + 1]) {',
  '    const hi = f - 1',
  '    if (hi < lo) { lo = f + 1; continue }',
  '    const length = hi - lo + 1',
  '    const budget = maxSum - total',
  '    const k = largestCount(lo, length, budget)',
  '    total += k * lo + (k * (k - 1)) / 2',
  '    count += k',
  '    if (k < length) return count',
  '    lo = f + 1',
  '  }',
  '  return count',
  '}',
]

const PY = [
  'def max_numbers(banned, n, max_sum):',
  '    forbidden = sorted(set(x for x in banned if 1 <= x <= n))',
  '    total = 0',
  '    count = 0',
  '    lo = 1',
  '    for f in forbidden + [n + 1]:',
  '        hi = f - 1',
  '        if hi >= lo:',
  '            length = hi - lo + 1',
  '            budget = max_sum - total',
  '            a, b = 0, length',
  '            while a < b:',
  '                mid = (a + b + 1) // 2',
  '                if mid * lo + mid * (mid - 1) // 2 <= budget:',
  '                    a = mid',
  '                else:',
  '                    b = mid - 1',
  '            k = a',
  '            total += k * lo + k * (k - 1) // 2',
  '            count += k',
  '            if k < length:',
  '                return count',
  '        lo = f + 1',
  '    return count',
]

const at = (lines, text) => {
  const index = lines.findIndex(line => line.trim() === text.trim())
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}
const codeLine = text => at(CODE, text)
const pyLine = text => at(PY, text)

export const phases = [
  { id: 'start', label: 'Forbidden', description: 'Find the banned values inside the range.' },
  { id: 'gap', label: 'Gap', description: 'Take as many numbers from this gap as the budget allows.' },
  { id: 'stop', label: 'Budget', description: 'The budget cannot take the next number.' },
  { id: 'done', label: 'Result', description: 'Report the count.' },
]

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with banned, n and maxSum.')
  const { banned, n, maxSum } = input
  if (!Array.isArray(banned) || banned.length > 20 || !banned.every(x => Number.isInteger(x) && x >= 1 && x <= 100)) throw new Error('banned is a list of at most 20 integers from 1 to 100.')
  if (!Number.isInteger(n) || n < 1 || n > 100) throw new Error('n is an integer from 1 to 100 in this visualization.')
  if (!Number.isInteger(maxSum) || maxSum < 1 || maxSum > 1000) throw new Error('maxSum is an integer from 1 to 1000 in this visualization.')
  return { banned, n, maxSum }
}

export function buildTrace({ banned, n, maxSum }) {
  const forbidden = [...new Set(banned.filter(x => x >= 1 && x <= n))].sort((a, b) => a - b)
  const frames = []
  let total = 0
  let count = 0
  let lo = 1
  frames.push({ pythonLine: pyLine('forbidden = sorted(set(x for x in banned if 1 <= x <= n))'), phase: 'start', activeLine: codeLine('const forbidden = [...new Set(banned.filter(x => x >= 1 && x <= n))].sort((a, b) => a - b)'), gap: null, forbidden, total, count, message: `Forbidden values inside 1..${n}: ${forbidden.join(', ') || 'none'}. Budget ${maxSum}.` })
  const ends = [...forbidden, n + 1]
  for (const f of ends) {
    const hi = f - 1
    if (hi < lo) { lo = f + 1; continue }
    const length = hi - lo + 1
    const budget = maxSum - total
    let a = 0, b = length
    while (a < b) {
      const mid = Math.floor((a + b + 1) / 2)
      if (mid * lo + (mid * (mid - 1)) / 2 <= budget) a = mid
      else b = mid - 1
    }
    const k = a
    total += k * lo + (k * (k - 1)) / 2
    count += k
    frames.push({ pythonLine: pyLine('k = a'), phase: 'gap', activeLine: codeLine('const k = largestCount(lo, length, budget)'), gap: [lo, hi], k, len: length, forbidden, total, count, message: `Gap ${lo}..${hi} (${length} number${length === 1 ? '' : 's'}): take ${k}. Sum ${total}, count ${count}.` })
    if (k < length) {
      frames.push({ pythonLine: pyLine('return count'), phase: 'stop', activeLine: codeLine('if (k < length) return count'), gap: [lo, hi], k, len: length, forbidden, total, count, message: `The next number ${lo + k} would exceed the budget. Stop with ${count}.` })
      return { input: { banned, n, maxSum }, result: count, frames }
    }
    lo = f + 1
  }
  frames.push({ pythonLine: pyLine('return count'), phase: 'done', activeLine: codeLine('return count'), gap: null, forbidden, total, count, message: `All allowed numbers fit. Maximum count ${count}.` })
  return { input: { banned, n, maxSum }, result: count, frames }
}

export const code = CODE.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n') + '\n'
