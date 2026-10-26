export const code = `def makeLargestSpecial(s):
    pieces = []
    count = start = 0
    for i, ch in enumerate(s):
        count += 1 if ch == '1' else -1
        if count == 0:
            inner = makeLargestSpecial(s[start + 1:i])
            pieces.append('1' + inner + '0')
            start = i + 1
    pieces.sort(reverse=True)
    return ''.join(pieces)`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

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
    frames.push({ phase: 'call', activeLine: L('def makeLargest'), ...snap({ cur: str, offset, i: -1, start: 0, pieces: [] }), message: `Solve "${str || '(empty)'}" (depth ${stack.length}).` })
    const pieces = []
    let count = 0, start = 0
    for (let i = 0; i < str.length; i++) {
      count += str[i] === '1' ? 1 : -1
      frames.push({ phase: 'scan', activeLine: L('count +='), ...snap({ cur: str, offset, i, start, count, pieces: [...pieces] }), message: `'${str[i]}' makes the balance ${count}.` })
      if (count === 0) {
        frames.push({ phase: 'split', activeLine: L('if count == 0'), ...snap({ cur: str, offset, i, start, count, pieces: [...pieces] }), message: `Balance returns to 0 at ${i}: "${str.slice(start, i + 1)}" is a primitive special string. Recurse on its interior "${str.slice(start + 1, i) || '(empty)'}".` })
        const inner = solve(str.slice(start + 1, i), offset + start + 1)
        pieces.push('1' + inner + '0')
        frames.push({ phase: 'collect', activeLine: L('pieces.append'), ...snap({ cur: str, offset, i, start, count, pieces: [...pieces] }), message: `Wrap the improved interior: "1${inner}0".` })
        start = i + 1
      }
    }
    const sorted = [...pieces].sort().reverse()
    const result = sorted.join('')
    frames.push({ phase: 'sort', activeLine: L('pieces.sort'), ...snap({ cur: str, offset, i: str.length - 1, start, pieces: sorted }), message: pieces.length > 1 ? `Sort the ${pieces.length} pieces in descending order; swapping adjacent special pieces keeps validity and puts larger ones first.` : `${pieces.length} piece${pieces.length ? '' : 's'}: nothing to reorder.` })
    frames.push({ phase: 'return', activeLine: L("return ''.join"), ...snap({ cur: str, offset, i: str.length - 1, start, pieces: sorted }), message: `Return "${result || '(empty)'}".` })
    stack.pop()
    return result
  }
  frames.push({ phase: 'start', activeLine: L('def makeLargest'), stack: [], cur: s, offset: 0, i: -1, start: 0, pieces: [], message: 'A special string is balanced with prefix balance never negative. Swapping adjacent special substrings is allowed; find the lexicographically largest result.' })
  const result = solve(s, 0)
  frames.push({ phase: 'done', activeLine: L("return ''.join"), stack: [], cur: result, offset: 0, i: -1, start: 0, pieces: [], message: `Largest special string: ${result}.` })
  return { input: s, result, frames }
}
