export const code = `function makeLargestSpecial(s):
  pieces = empty list
  count = 0, start = 0
  for each index i and character ch in s:
    add 1 to count if ch is '1', otherwise subtract 1
    if count is zero then
      inner = makeLargestSpecial of the characters strictly between start and i
      append "1" + inner + "0" to pieces
      start = i + 1
  sort pieces in descending order
  return the pieces joined together in order`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def make_largest_special(s):
    pieces = []
    count = start = 0
    for i, ch in enumerate(s):
        count += 1 if ch == '1' else -1
        if count == 0:
            inner = make_largest_special(s[start + 1:i])
            pieces.append('1' + inner + '0')
            start = i + 1
    pieces.sort(reverse=True)
    return ''.join(pieces)`

export function isSpecial(s) {
  let c = 0
  for (const ch of s) { c += ch === '1' ? 1 : -1; if (c < 0) return false }
  return c === 0
}

export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || !/^[01]+$/.test(s)) throw new Error('Enter a JSON string of 0s and 1s.')
  if (s.length > 60) throw new Error('Visualization cap: at most 60 characters.')
  if (!isSpecial(s)) throw new Error('Not a special binary string: it needs equal 0s and 1s and every prefix must have at least as many 1s as 0s.')
  return s
}

export function buildTrace(s) {
  const frames = []
  const stack = []
  const snap = extra => ({ stack: stack.map(f => f.s), ...extra })
  function solve(str, offset) {
    stack.push({ s: str })
    frames.push({ phase: 'call', activeLine: L('function makeLargest'), pythonLine: 2, ...snap({ cur: str, offset, i: -1, start: 0, pieces: [] }), message: `Solve "${str || '(empty)'}" (depth ${stack.length}).` })
    const pieces = []
    let count = 0, start = 0
    for (let i = 0; i < str.length; i++) {
      count += str[i] === '1' ? 1 : -1
      frames.push({ phase: 'scan', activeLine: L('add 1 to count'), pythonLine: 5, ...snap({ cur: str, offset, i, start, count, pieces: [...pieces] }), message: `'${str[i]}' makes the balance ${count}.` })
      if (count === 0) {
        frames.push({ phase: 'split', activeLine: L('if count is zero'), pythonLine: 7, ...snap({ cur: str, offset, i, start, count, pieces: [...pieces] }), message: `Balance returns to 0 at ${i}: "${str.slice(start, i + 1)}" is a primitive special string. Recurse on its interior "${str.slice(start + 1, i) || '(empty)'}".` })
        const inner = solve(str.slice(start + 1, i), offset + start + 1)
        pieces.push('1' + inner + '0')
        frames.push({ phase: 'collect', activeLine: L('append "1" + inner'), pythonLine: 8, ...snap({ cur: str, offset, i, start, count, pieces: [...pieces] }), message: `Wrap the improved interior: "1${inner}0".` })
        start = i + 1
      }
    }
    const sorted = [...pieces].sort().reverse()
    const result = sorted.join('')
    frames.push({ phase: 'sort', activeLine: L('sort pieces in descending'), pythonLine: 10, ...snap({ cur: str, offset, i: str.length - 1, start, pieces: sorted }), message: pieces.length > 1 ? `Sort the ${pieces.length} pieces in descending order; swapping adjacent special pieces keeps validity and puts larger ones first.` : `${pieces.length} piece${pieces.length ? '' : 's'}: nothing to reorder.` })
    frames.push({ phase: 'return', activeLine: L('pieces joined together'), pythonLine: 11, ...snap({ cur: str, offset, i: str.length - 1, start, pieces: sorted }), message: `Return "${result || '(empty)'}".` })
    stack.pop()
    return result
  }
  frames.push({ phase: 'start', activeLine: L('function makeLargest'), pythonLine: 1, stack: [], cur: s, offset: 0, i: -1, start: 0, pieces: [], message: 'A special string is balanced with prefix balance never negative. Swapping adjacent special substrings is allowed; find the lexicographically largest result.' })
  const result = solve(s, 0)
  frames.push({ phase: 'done', activeLine: L('pieces joined together'), pythonLine: 11, stack: [], cur: result, offset: 0, i: -1, start: 0, pieces: [], message: `Largest special string: ${result}.` })
  return { input: s, result, frames }
}
