export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || Array.isArray(input) || !Array.isArray(input.nums)) throw new Error('Use an object with a nums list.')
  const { nums } = input
  if (nums.length < 2 || nums.length > 12) throw new Error('nums has 2 to 12 integers.')
  if (!nums.every(v => Number.isInteger(v) && Math.abs(v) <= 100)) throw new Error('Values are integers from -100 to 100.')
  if (new Set(nums).size !== nums.length) throw new Error('Values must be unique.')
  return { nums }
}

export function buildTrace({ nums }) {
  const frames = []
  const sorted = [...nums].sort((x, y) => x - y)
  const present = new Set(nums)
  const lo = sorted[0]
  const hi = sorted[sorted.length - 1]
  frames.push({ pythonLine: P('present = set'), phase: 'sort', activeLine: L('const sorted'), at: -1, value: null, missing: [], message: `Smallest ${lo}, largest ${hi}: scan the full range.` })
  const missing = []
  for (let v = lo; v <= hi; v++) {
    if (present.has(v)) {
      frames.push({ pythonLine: P('if v in present'), phase: 'scan', activeLine: L('if (present.has(v))'), at: v - lo, value: v, missing: [...missing], message: `${v} is present, skip it.` })
    } else {
      missing.push(v)
      frames.push({ pythonLine: P('missing.append'), phase: 'missing', activeLine: L('missing.push(v)'), at: v - lo, value: v, missing: [...missing], message: `${v} is missing, record it.` })
    }
  }
  frames.push({ pythonLine: P('return missing'), phase: 'done', activeLine: L('return missing'), at: -1, value: null, missing: [...missing], message: missing.length ? `Missing values: ${missing.join(', ')}.` : 'Nothing is missing.' })
  return { input: { nums }, result: missing, frames }
}

export const code = `function findMissingElements(nums) {
  const present = new Set(nums)
  const sorted = [...nums].sort((x, y) => x - y)
  const lo = sorted[0]
  const hi = sorted[sorted.length - 1]
  const missing = []
  for (let v = lo; v <= hi; v++) {
    if (present.has(v)) continue
    missing.push(v)
  }
  return missing
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => {
  const hit = code.find(c => c.text.includes(s))
  if (!hit) throw new Error(`No JavaScript line contains "${s}".`)
  return hit.line
}
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`No Python line contains "${s}".`)
  return index + 1
}

export const python = `def find_missing(nums):
    present = set(nums)
    low, high = min(nums), max(nums)
    missing = []
    for v in range(low, high + 1):
        if v in present:
            continue
        missing.append(v)
    return missing
`
