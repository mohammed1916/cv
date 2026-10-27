const MAX_LENGTH = 8
const MAX_VALUE = 99999

export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || !Array.isArray(data.arr1) || !Array.isArray(data.arr2)) throw new Error('Use an object like {"arr1":[1,10],"arr2":[100]}.')
  for (const arr of [data.arr1, data.arr2]) {
    if (arr.length < 1 || arr.length > MAX_LENGTH) throw new Error(`Each array has 1 to ${MAX_LENGTH} values.`)
    if (arr.some(v => !Number.isInteger(v) || v < 1 || v > MAX_VALUE)) throw new Error(`Values are integers from 1 to ${MAX_VALUE}.`)
  }
  return { arr1: data.arr1, arr2: data.arr2 }
}

export function buildTrace({ arr1, arr2 }) {
  const seen = new Set()
  const prefixes = []
  const frames = [{ phase: 'start', activeLine: L('set up an empty set'), prefixes: [], current: null, best: 0, message: 'Start with an empty set of prefixes.' }]
  for (const x of arr1) {
    const s = String(x)
    for (let i = 1; i <= s.length; i++) {
      const p = s.slice(0, i)
      if (!seen.has(p)) { seen.add(p); prefixes.push(p) }
    }
    frames.push({ phase: 'insert', activeLine: L('add every prefix of x'), prefixes: [...prefixes], current: x, best: 0, message: `Added the prefixes of ${x} to the set.` })
  }
  let best = 0
  for (const y of arr2) {
    const s = String(y)
    let found = 0
    for (let i = s.length; i >= 1; i--) {
      if (seen.has(s.slice(0, i))) { found = i; break }
    }
    if (found > best) best = found
    frames.push({ phase: 'query', activeLine: L('check its prefixes'), prefixes: [...prefixes], current: y, found, best, message: found ? `${y} shares a prefix of length ${found}. Best: ${best}.` : `${y} shares no prefix with arr1.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), prefixes: [...prefixes], current: null, best, message: `Longest common prefix length: ${best}.` })
  return { input: { arr1, arr2 }, result: best, frames }
}

export const code = `longest common prefix length between two lists
  set up an empty set of prefixes
  for each number x in arr1
    add every prefix of x to the set as text
  set best to 0
  for each number y in arr2
    check its prefixes from longest to shortest
    if a prefix is in the set then
      if its length is more than best then set best to its length
      stop checking the shorter prefixes of y
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_common_prefix(arr1, arr2):
    prefixes = set()
    for x in arr1:
        text = str(x)
        for i in range(1, len(text) + 1):
            prefixes.add(text[:i])
    best = 0
    for y in arr2:
        text = str(y)
        for i in range(len(text), 0, -1):
            if text[:i] in prefixes:
                best = max(best, i)
                break
    return best
`
