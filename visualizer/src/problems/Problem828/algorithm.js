export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || !/^[A-Z]{1,100}$/.test(s)) throw new Error('Enter a JSON string of 1-100 uppercase letters (visualization cap).')
  return s
}
export function buildTrace(s) {
  const n = s.length
  let total = 0
  const frames = [{ phase: 'start', index: -1, left: -1, right: n, add: 0, total: 0, activeLine: L('set n to the length'), message: 'Instead of scanning substrings, count for each character occurrence the substrings where it is the only copy of that letter.', pythonLine: 2 }]
  const contributions = []
  for (let i = 0; i < n; i++) {
    const left = s.lastIndexOf(s[i], i - 1)
    let right = s.indexOf(s[i], i + 1)
    if (right === -1) right = n
    const l = i === 0 ? -1 : left
    frames.push({ phase: 'bounds', index: i, left: l, right, add: 0, total, activeLine: L('set left to'),
      message: `"${s[i]}" at ${i}: previous "${s[i]}" at ${l === -1 ? 'none (-1)' : l}, next at ${right === n ? `none (${n})` : right}. The substring must start in (${l}, ${i}] and end in [${i}, ${right}).`, pythonLine: right === n ? 8 : 6 })
    const add = (i - l) * (right - i)
    total += add
    contributions.push(add)
    frames.push({ phase: 'add', index: i, left: l, right, add, total, activeLine: L('set total to total'), message: `Choices: ${i - l} starts x ${right - i} ends = ${add}. Running total ${total}.`, pythonLine: 9 })
  }
  frames.push({ phase: 'done', index: n - 1, left: -1, right: n, add: 0, total, activeLine: L('return total'), message: `Sum of unique-character counts over all substrings: ${total}.`, pythonLine: 10 })
  return { input: s, contributions, result: total, frames }
}
export const code = `set n to the length of s and total to 0
for each index i from 0 to n - 1 with letter c = s[i]
  set left to the index of the previous copy of c, or -1 if there is none
  set right to the index of the next copy of c, or n if there is none
  set total to total + (i - left) * (right - i)
return total`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def unique_letter_string(s):
    n = len(s)
    total = 0
    for i, c in enumerate(s):
        left = s.rfind(c, 0, i)
        right = s.find(c, i + 1)
        if right == -1:
            right = n
        total += (i - left) * (right - i)
    return total
`
