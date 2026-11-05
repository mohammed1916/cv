const DIGITS = /^[0-9]$/

function readNumber(s, i) {
  let j = i
  while (j < s.length && DIGITS.test(s[j])) j++
  return { value: Number(s.slice(i, j)), next: j }
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s1 and s2.')
  const { s1, s2 } = input
  for (const s of [s1, s2]) {
    if (typeof s !== 'string' || s.length < 1 || s.length > 40 || !/^[a-z0-9]+$/.test(s)) throw new Error('Each string has 1 to 40 lowercase letters or digits.')
    for (const run of s.match(/[0-9]+/g) ?? []) {
      if (run[0] === '0') throw new Error('A number has no leading zero.')
      if (Number(run) > 999) throw new Error('A number is at most 999.')
    }
  }
  return { s1, s2 }
}

export function buildTrace({ s1, s2 }) {
  const n1 = s1.length
  const n2 = s2.length
  const seen = new Set()
  const stack = [[0, 0, 0]]
  const frames = []
  frames.push({ pythonLine: P('stack = [(0, 0, 0)]'), phase: 'start', activeLine: L('start a search at (0, 0)'), i: 0, j: 0, d: 0, message: 'Start at both first characters with no pending wildcards.' })
  let result = false
  while (stack.length && !result) {
    const [i, j, d] = stack.pop()
    const key = `${i},${j},${d}`
    if (seen.has(key)) {
      frames.push({ pythonLine: P('if (i, j, d) in seen:'), phase: 'skip', activeLine: L('visited states are skipped'), i, j, d, message: `State (${i}, ${j}, ${d}) was already explored.` })
      continue
    }
    seen.add(key)
    frames.push({ pythonLine: P('i, j, d = stack.pop()'), phase: 'visit', activeLine: L('pop (i, j, d)'), i, j, d, message: `Visit i=${i}, j=${j}, pending d=${d}.` })
    if (i === n1 && j === n2 && d === 0) {
      result = true
      frames.push({ pythonLine: P('return True'), phase: 'found', activeLine: L('both strings are used up'), i, j, d, message: 'Both encodings end with no pending wildcards.' })
      break
    }
    if (i < n1 && DIGITS.test(s1[i])) {
      const { value, next } = readNumber(s1, i)
      stack.push([next, j, d + value])
      frames.push({ pythonLine: P('stack.append((ni, j, d + k))'), phase: 'wild1', activeLine: L('if s1 has a number'), i, j, d, message: `s1 skips ${value} characters, so d becomes ${d + value}.` })
    }
    if (j < n2 && DIGITS.test(s2[j])) {
      const { value, next } = readNumber(s2, j)
      stack.push([i, next, d - value])
      frames.push({ pythonLine: P('stack.append((i, nj, d - k))'), phase: 'wild2', activeLine: L('if s2 has a number'), i, j, d, message: `s2 skips ${value} characters, so d becomes ${d - value}.` })
    }
    if (d > 0 && j < n2 && /[a-z]/.test(s2[j])) {
      stack.push([i, j + 1, d - 1])
      frames.push({ pythonLine: P('stack.append((i, j + 1, d - 1))'), phase: 'cover2', activeLine: L('if d is positive'), i, j, d, message: `s2 letter ${s2[j]} covers one pending wildcard of s1.` })
    }
    if (d < 0 && i < n1 && /[a-z]/.test(s1[i])) {
      stack.push([i + 1, j, d + 1])
      frames.push({ pythonLine: P('stack.append((i + 1, j, d + 1))'), phase: 'cover1', activeLine: L('if d is negative'), i, j, d, message: `s1 letter ${s1[i]} covers one pending wildcard of s2.` })
    }
    if (d === 0 && i < n1 && j < n2 && /[a-z]/.test(s1[i]) && /[a-z]/.test(s2[j]) && s1[i] === s2[j]) {
      stack.push([i + 1, j + 1, 0])
      frames.push({ pythonLine: P('stack.append((i + 1, j + 1, 0))'), phase: 'match', activeLine: L('if d is zero and the letters'), i, j, d, message: `${s1[i]} matches ${s2[j]} directly.` })
    }
  }
  if (!result) frames.push({ pythonLine: P('return False'), phase: 'done', activeLine: L('return false'), i: -1, j: -1, d: 0, message: 'No original string fits both encodings.' })
  else frames.push({ pythonLine: P('return True'), phase: 'done', activeLine: L('both strings are used up'), i: -1, j: -1, d: 0, message: 'An original string fits both encodings.' })
  return { input: { s1, s2 }, result, frames }
}

export const code = `can both encodings describe one original string
  start a search at (0, 0) with pending difference 0
  visited states are skipped
  pop (i, j, d)
  if both strings are used up and d is zero then return true
  if s1 has a number k at i then move i past it and add k to d
  if s2 has a number k at j then move j past it and subtract k from d
  if d is positive and s2 has a letter at j then move j and subtract 1
  if d is negative and s1 has a letter at i then move i and add 1
  if d is zero and the letters at i and j are equal then move both
  return false when the search runs out`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def read_number(s, i):
    j = i
    while j < len(s) and s[j].isdigit():
        j += 1
    return int(s[i:j]), j

def original_exists(s1, s2):
    n1, n2 = len(s1), len(s2)
    seen = set()
    stack = [(0, 0, 0)]
    while stack:
        i, j, d = stack.pop()
        if (i, j, d) in seen:
            continue
        seen.add((i, j, d))
        if i == n1 and j == n2 and d == 0:
            return True
        if i < n1 and s1[i].isdigit():
            k, ni = read_number(s1, i)
            stack.append((ni, j, d + k))
        if j < n2 and s2[j].isdigit():
            k, nj = read_number(s2, j)
            stack.append((i, nj, d - k))
        if d > 0 and j < n2 and s2[j].isalpha():
            stack.append((i, j + 1, d - 1))
        if d < 0 and i < n1 and s1[i].isalpha():
            stack.append((i + 1, j, d + 1))
        if d == 0 and i < n1 and j < n2 and s1[i].isalpha() and s2[j].isalpha() and s1[i] == s2[j]:
            stack.append((i + 1, j + 1, 0))
    return False
`
const PY_LINES = python.split('\n')
const P = s => PY_LINES.findIndex(line => line.includes(s)) + 1
