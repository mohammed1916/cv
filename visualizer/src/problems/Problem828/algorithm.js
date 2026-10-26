export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || !/^[A-Z]{1,100}$/.test(s)) throw new Error('Enter a JSON string of 1-100 uppercase letters (visualization cap).')
  return s
}
export function buildTrace(s) {
  const n = s.length
  let total = 0
  const frames = [{ phase: 'start', index: -1, left: -1, right: n, add: 0, total: 0, activeLine: 3, message: 'Instead of scanning substrings, count for each character occurrence the substrings where it is the only copy of that letter.' }]
  const contributions = []
  for (let i = 0; i < n; i++) {
    const left = s.lastIndexOf(s[i], i - 1)
    let right = s.indexOf(s[i], i + 1)
    if (right === -1) right = n
    const l = i === 0 ? -1 : left
    frames.push({ phase: 'bounds', index: i, left: l, right, add: 0, total, activeLine: 6,
      message: `"${s[i]}" at ${i}: previous "${s[i]}" at ${l === -1 ? 'none (-1)' : l}, next at ${right === n ? `none (${n})` : right}. The substring must start in (${l}, ${i}] and end in [${i}, ${right}).` })
    const add = (i - l) * (right - i)
    total += add
    contributions.push(add)
    frames.push({ phase: 'add', index: i, left: l, right, add, total, activeLine: 9, message: `Choices: ${i - l} starts x ${right - i} ends = ${add}. Running total ${total}.` })
  }
  frames.push({ phase: 'done', index: n - 1, left: -1, right: n, add: 0, total, activeLine: 10, message: `Sum of unique-character counts over all substrings: ${total}.` })
  return { input: s, contributions, result: total, frames }
}
export const code = `def uniqueLetterString(s):
    n = len(s)
    total = 0
    for i, c in enumerate(s):
        left = s.rfind(c, 0, i)
        right = s.find(c, i + 1)
        if right == -1:
            right = n
        total += (i - left) * (right - i)
    return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
