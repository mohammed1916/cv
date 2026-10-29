const PYTHON_SOURCE = `def categorize_box(length, width, height, mass):
    volume = length * width * height
    bulky = length >= 10000 or width >= 10000 or height >= 10000 or volume >= 1000000000
    heavy = mass >= 100
    if bulky and heavy:
        return "Both"
    if bulky:
        return "Bulky"
    if heavy:
        return "Heavy"
    return "Neither"`

const PY = PYTHON_SOURCE.split('\n')
const py = (text) => {
  const index = PY.findIndex((line) => line.trim() === text)
  if (index < 0) throw new Error(`Python line not found: ${text}`)
  return index + 1
}

export const python = PYTHON_SOURCE

export const code = [
  { line: 1, text: 'function categorizeBox(length, width, height, mass)' },
  { line: 2, text: 'volume = length times width times height' },
  { line: 3, text: 'bulky = any dimension is at least 10000, or volume is at least 10^9' },
  { line: 4, text: 'heavy = mass is at least 100' },
  { line: 5, text: 'if bulky and heavy return Both' },
  { line: 6, text: 'if bulky return Bulky' },
  { line: 7, text: 'if heavy return Heavy' },
  { line: 8, text: 'return Neither' },
]

export function parseInput(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Input must be valid JSON, for example {"length": 1000, "width": 35, "height": 700, "mass": 300}')
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Input must be a JSON object')
  for (const key of ['length', 'width', 'height']) {
    const value = data[key]
    if (!Number.isInteger(value) || value < 1 || value > 100000) throw new Error(`${key} must be an integer from 1 to 10^5`)
  }
  if (!Number.isInteger(data.mass) || data.mass < 1 || data.mass > 1000) throw new Error('mass must be an integer from 1 to 1000')
  return { length: data.length, width: data.width, height: data.height, mass: data.mass }
}

export function buildTrace(input) {
  const { length, width, height, mass } = input
  const frames = []
  const dims = [length, width, height, mass]
  let volume = null
  let bulky = null
  let heavy = null
  const add = (fields) => frames.push({ dims, length, width, height, mass, volume, bulky, heavy, result: null, ...fields })

  add({ phase: 'init', activeLine: 2, pythonLine: py('volume = length * width * height'), message: 'Read the four box values.', index: -1 })
  volume = length * width * height
  add({ phase: 'init', activeLine: 2, pythonLine: py('volume = length * width * height'), message: `Volume is ${length} x ${width} x ${height} = ${volume}.`, index: -1 })
  bulky = length >= 10000 || width >= 10000 || height >= 10000 || volume >= 1000000000
  add({ phase: 'check', activeLine: 3, pythonLine: py('bulky = length >= 10000 or width >= 10000 or height >= 10000 or volume >= 1000000000'), message: bulky ? 'Bulky: a dimension reaches 10000 or the volume reaches 10^9.' : 'Not bulky: every dimension is below 10000 and the volume is below 10^9.', result: bulky, index: -1 })
  heavy = mass >= 100
  add({ phase: 'check', activeLine: 4, pythonLine: py('heavy = mass >= 100'), message: heavy ? `Heavy: mass ${mass} is at least 100.` : `Not heavy: mass ${mass} is below 100.`, result: heavy, index: -1 })

  let answer
  if (bulky && heavy) answer = 'Both'
  else if (bulky) answer = 'Bulky'
  else if (heavy) answer = 'Heavy'
  else answer = 'Neither'

  add({ phase: 'check', activeLine: 5, pythonLine: py('if bulky and heavy:'), message: `Both flags set: ${bulky && heavy}.`, result: bulky && heavy, index: -1 })
  if (bulky && heavy) {
    add({ phase: 'done', activeLine: 5, pythonLine: py('return "Both"'), message: 'Return Both.', result: answer, index: -1 })
  } else {
    add({ phase: 'check', activeLine: 6, pythonLine: py('if bulky:'), message: `Bulky flag: ${bulky}.`, result: bulky, index: -1 })
    if (bulky) {
      add({ phase: 'done', activeLine: 6, pythonLine: py('return "Bulky"'), message: 'Return Bulky.', result: answer, index: -1 })
    } else {
      add({ phase: 'check', activeLine: 7, pythonLine: py('if heavy:'), message: `Heavy flag: ${heavy}.`, result: heavy, index: -1 })
      if (heavy) add({ phase: 'done', activeLine: 7, pythonLine: py('return "Heavy"'), message: 'Return Heavy.', result: answer, index: -1 })
      else add({ phase: 'done', activeLine: 8, pythonLine: py('return "Neither"'), message: 'Return Neither.', result: answer, index: -1 })
    }
  }
  return { input, result: answer, frames }
}
