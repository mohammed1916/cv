const PYTHON_SOURCE = `def max_captured_forts(forts):
    best = 0
    last = -1
    for i, fort in enumerate(forts):
        if fort != 0:
            if last != -1 and forts[last] != fort:
                best = max(best, i - last - 1)
            last = i
    return best`

const PY = PYTHON_SOURCE.split('\n')
const py = (text) => {
  const index = PY.findIndex((line) => line.trim() === text)
  if (index < 0) throw new Error(`Python line not found: ${text}`)
  return index + 1
}

export const python = PYTHON_SOURCE

export const code = [
  { line: 1, text: 'function maxCapturedForts(forts)' },
  { line: 2, text: 'best = 0 and last = -1' },
  { line: 3, text: 'for i from 0 to length of forts minus 1' },
  { line: 4, text: 'if forts[i] is not 0' },
  { line: 5, text: 'if last exists and forts[last] is the opposite boundary type' },
  { line: 6, text: 'best = max(best, i minus last minus 1)' },
  { line: 7, text: 'last = i' },
  { line: 8, text: 'return best' },
]

export function parseInput(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Input must be valid JSON, for example {"forts": [1, 0, -1]}')
  }
  if (!data || typeof data !== 'object' || Array.isArray(data) || !Array.isArray(data.forts)) {
    throw new Error('Input must be an object with a forts array')
  }
  if (data.forts.length < 1 || data.forts.length > 1000) {
    throw new Error('forts length must be between 1 and 1000')
  }
  for (const value of data.forts) {
    if (![-1, 0, 1].includes(value)) throw new Error('Each fort value must be -1 (empty), 0 (enemy fort), or 1 (your fort)')
  }
  return { forts: data.forts }
}

export function buildTrace(input) {
  const { forts } = input
  const frames = []
  let best = 0
  let last = -1
  let index = -1
  const add = (fields) => frames.push({ forts: [...forts], best, last, index, result: null, ...fields })

  add({ phase: 'init', activeLine: 2, pythonLine: py('best = 0'), message: 'Start with no capture recorded.' })
  add({ phase: 'init', activeLine: 2, pythonLine: py('last = -1'), message: 'No own fort or empty cell has been seen yet, so last is -1.' })

  for (let i = 0; i < forts.length; i++) {
    index = i
    add({ phase: 'scan', activeLine: 3, pythonLine: py('for i, fort in enumerate(forts):'), message: `Look at position ${i} (value ${forts[i]}).` })
    if (forts[i] === 0) {
      add({ phase: 'check', activeLine: 4, pythonLine: py('if fort != 0:'), message: `Position ${i} is an enemy fort (0). It is not a boundary, so it is skipped.` })
      continue
    }
    add({ phase: 'check', activeLine: 4, pythonLine: py('if fort != 0:'), message: `Position ${i} is a boundary: your fort (1) or empty cell (-1).` })
    if (last !== -1) {
      const opposite = forts[last] !== forts[i]
      add({
        phase: 'check',
        activeLine: 5,
        pythonLine: py('if last != -1 and forts[last] != fort:'),
        message: opposite
          ? `The previous boundary at ${last} is the opposite type, so the ${i - last - 1} enemy forts between them can be captured.`
          : `The previous boundary at ${last} is the same type, so nothing is captured between them.`,
        result: opposite,
      })
      if (opposite) {
        best = Math.max(best, i - last - 1)
        add({ phase: 'update', activeLine: 6, pythonLine: py('best = max(best, i - last - 1)'), message: `Best capture is now ${best}.` })
      }
    }
    last = i
    add({ phase: 'update', activeLine: 7, pythonLine: py('last = i'), message: `Remember position ${i} as the last boundary.` })
  }

  add({ phase: 'done', activeLine: 8, pythonLine: py('return best'), message: `Return ${best}, the most enemy forts one move can capture.`, result: best })
  return { input, result: best, frames }
}
