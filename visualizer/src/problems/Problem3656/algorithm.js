// Determine if a Simple Graph Exists. A degree list is graphical when its sum is even and
// the Erdos-Gallai inequalities hold: for each k, the k largest degrees sum to at most
// k(k - 1) plus the capped degrees of the rest.

const MAX_VERTICES = 10
const MAX_DEGREE = 12

const CODE_TEXT = [
  'FUNCTION isGraphical(degrees)',
  '    IF the sum of degrees is odd RETURN false',
  '    sorted ← degrees in nonincreasing order; n ← len(degrees)',
  '    FOR k from 1 to n',
  '        left ← sum of sorted[1..k]',
  '        right ← k(k − 1) + sum of min(sorted[i], k) for i > k',
  '        IF left > right RETURN false',
  '    RETURN true',
]

const PY = [
  'def is_graphical(degrees):',
  '    if sum(degrees) % 2:',
  '        return False',
  '    d = sorted(degrees, reverse=True)',
  '    n = len(d)',
  '    for k in range(1, n + 1):',
  '        left = sum(d[:k])',
  '        right = k * (k - 1) + sum(min(x, k) for x in d[k:])',
  '        if left > right:',
  '            return False',
  '    return True',
  '',
  'if __name__ == "__main__":',
  '    import sys, json',
  '    print(json.dumps(is_graphical(json.loads(sys.stdin.read()))))',
]

const PHASES = [
  { id: 'parity', label: 'Parity', description: 'The degree sum must be even.' },
  { id: 'sort', label: 'Sort', description: 'Order the degrees from largest to smallest.' },
  { id: 'check', label: 'Check k', description: 'Compare the top k degrees with the bound.' },
  { id: 'fail', label: 'Fail', description: 'The top k degrees are too demanding.' },
  { id: 'done', label: 'Result', description: 'Report whether a simple graph exists.' },
]

export const code = CODE_TEXT.map((text, index) => ({ line: index + 1, text }))
export const python = PY.join('\n')
export const phases = PHASES

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = PY.findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const degrees = JSON.parse(text)
  if (!Array.isArray(degrees) || degrees.length < 1 || degrees.length > MAX_VERTICES) throw new Error(`Use a list of 1 to ${MAX_VERTICES} degrees.`)
  if (!degrees.every(d => Number.isInteger(d) && d >= 0 && d <= MAX_DEGREE)) throw new Error(`Each degree is an integer from 0 to ${MAX_DEGREE}.`)
  return degrees
}

export function buildTrace(degrees) {
  const n = degrees.length
  const sum = degrees.reduce((a, b) => a + b, 0)
  const frames = [{ pythonLine: P('if sum(degrees)'), phase: 'parity', activeLine: L('IF the sum of degrees is odd'), sorted: null, k: null, left: null, right: null, message: `The degree sum is ${sum}.` }]
  if (sum % 2 === 1) {
    frames.push({ pythonLine: P('return False'), phase: 'fail', activeLine: L('RETURN false'), sorted: null, k: null, left: null, right: null, message: 'An odd degree sum cannot be a sum of edge endpoints.' })
    return { input: degrees, result: false, frames }
  }
  const sorted = [...degrees].sort((a, b) => b - a)
  frames.push({ pythonLine: P('d = sorted'), phase: 'sort', activeLine: L('sorted ← degrees'), sorted, k: null, left: null, right: null, message: `Sorted degrees: ${sorted.join(', ')}.` })
  let result = true
  for (let k = 1; k <= n && result; k++) {
    const left = sorted.slice(0, k).reduce((a, b) => a + b, 0)
    const right = k * (k - 1) + sorted.slice(k).reduce((a, d) => a + Math.min(d, k), 0)
    if (left > right) {
      result = false
      frames.push({ pythonLine: P('return False'), phase: 'fail', activeLine: L('IF left > right'), sorted, k, left, right, message: `The top ${k} degrees need ${left} endpoints, but at most ${right} are available.` })
    } else {
      frames.push({ pythonLine: P('if left > right'), phase: 'check', activeLine: L('right ← k(k − 1)'), sorted, k, left, right, message: `k = ${k}: ${left} ≤ ${right}, so this bound holds.` })
    }
  }
  if (result) frames.push({ pythonLine: P('return True'), phase: 'done', activeLine: L('RETURN true'), sorted, k: null, left: null, right: null, message: 'Every bound holds, so a simple graph exists.' })
  else frames.push({ pythonLine: P('return False'), phase: 'done', activeLine: L('RETURN true'), sorted, k: null, left: null, right: null, message: 'No simple graph has this degree list.' })
  return { input: degrees, result, frames }
}
