const PYTHON_SOURCE = `def closest_target(words, target, startIndex):
    n = len(words)
    best = -1
    for i in range(n):
        if words[i] == target:
            gap = abs(i - startIndex)
            dist = min(gap, n - gap)
            if best == -1 or dist < best:
                best = dist
    return best`

const PY = PYTHON_SOURCE.split('\n')
const py = (text) => {
  const index = PY.findIndex((line) => line.trim() === text)
  if (index < 0) throw new Error(`Python line not found: ${text}`)
  return index + 1
}

export const python = PYTHON_SOURCE

export const code = [
  { line: 1, text: 'function closestTarget(words, target, startIndex)' },
  { line: 2, text: 'n = length of words and best = -1' },
  { line: 3, text: 'for i from 0 to n minus 1' },
  { line: 4, text: 'if words[i] equals target' },
  { line: 5, text: 'gap = absolute value of (i minus startIndex) and dist = smaller of gap and n minus gap' },
  { line: 6, text: 'if best is -1 or dist is less than best' },
  { line: 7, text: 'best = dist' },
  { line: 8, text: 'return best' },
]

export function parseInput(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Input must be valid JSON, for example {"words": ["a", "b"], "target": "a", "startIndex": 0}')
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Input must be a JSON object')
  const { words, target, startIndex } = data
  if (!Array.isArray(words) || words.length < 1 || words.length > 100) {
    throw new Error('words must be an array with between 1 and 100 strings')
  }
  for (const word of words) {
    if (typeof word !== 'string' || word.length < 1 || word.length > 100) {
      throw new Error('Each word must be a string of 1 to 100 characters')
    }
  }
  if (typeof target !== 'string' || target.length < 1 || target.length > 100) {
    throw new Error('target must be a string of 1 to 100 characters')
  }
  if (!Number.isInteger(startIndex) || startIndex < 0 || startIndex >= words.length) {
    throw new Error('startIndex must be an integer from 0 to words.length minus 1')
  }
  return { words: [...words], target, startIndex }
}

export function buildTrace(input) {
  const { words, target, startIndex } = input
  const n = words.length
  const frames = []
  let best = -1
  let index = -1
  let gap = null
  let dist = null
  const add = (fields) => frames.push({ words, target, startIndex, n, best, index, gap, dist, result: null, ...fields })

  add({ phase: 'init', activeLine: 2, pythonLine: py('n = len(words)'), message: `The circular array has ${n} words.` })
  add({ phase: 'init', activeLine: 2, pythonLine: py('best = -1'), message: 'No match found yet, so best is -1.' })

  for (let i = 0; i < n; i++) {
    index = i
    gap = null
    dist = null
    add({ phase: 'scan', activeLine: 3, pythonLine: py('for i in range(n):'), message: `Check position ${i} ("${words[i]}").` })
    const match = words[i] === target
    add({ phase: 'check', activeLine: 4, pythonLine: py('if words[i] == target:'), message: match ? `"${words[i]}" matches the target.` : `"${words[i]}" is not the target.`, result: match })
    if (!match) continue
    gap = Math.abs(i - startIndex)
    add({ phase: 'check', activeLine: 5, pythonLine: py('gap = abs(i - startIndex)'), message: `Steps in a straight line from start ${startIndex} to ${i}: ${gap}.` })
    dist = Math.min(gap, n - gap)
    add({ phase: 'check', activeLine: 5, pythonLine: py('dist = min(gap, n - gap)'), message: `Going around the circle is ${n - gap} steps, so the shorter distance is ${dist}.` })
    const better = best === -1 || dist < best
    add({ phase: 'check', activeLine: 6, pythonLine: py('if best == -1 or dist < best:'), message: better ? `Distance ${dist} is the best so far.` : `Distance ${dist} does not beat ${best}.`, result: better })
    if (better) {
      best = dist
      add({ phase: 'update', activeLine: 7, pythonLine: py('best = dist'), message: `Best distance is now ${best}.` })
    }
  }

  index = -1
  add({ phase: 'done', activeLine: 8, pythonLine: py('return best'), message: best === -1 ? 'The target is not in the array, so return -1.' : `Return ${best}, the shortest circular distance.`, result: best })
  return { input, result: best, frames }
}
