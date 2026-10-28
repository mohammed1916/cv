export function parseInput(text) {
  const s = JSON.parse(text)
  if (typeof s !== 'string' || s.length < 1 || s.length > 20) throw new Error('Use a JSON string of 1 to 20 digits.')
  if (!/^[0-9]+$/.test(s)) throw new Error('Use only the digits 0 to 9.')
  return s
}

export function buildTrace(s) {
  const chars = [...s]
  let swapAt = -1
  const frames = [{ phase: 'start', activeLine: L('for each adjacent pair'), index: -1, text: s, message: `Scan adjacent pairs in ${s} from the left.` }]
  for (let i = 0; i < chars.length - 1; i++) {
    const sameParity = Number(chars[i]) % 2 === Number(chars[i + 1]) % 2
    if (sameParity && chars[i] > chars[i + 1]) {
      swapAt = i
      frames.push({ phase: 'swap', activeLine: L('swap them'), index: i, text: s, message: `Positions ${i} and ${i + 1} have the same parity and ${chars[i]} is larger than ${chars[i + 1]}. Swap them.` })
      break
    }
    frames.push({ phase: 'scan', activeLine: L('if the digits have the same parity'), index: i, text: s, message: `Positions ${i} and ${i + 1} are ${chars[i]} and ${chars[i + 1]}. Keep scanning.` })
  }
  if (swapAt >= 0) [chars[swapAt], chars[swapAt + 1]] = [chars[swapAt + 1], chars[swapAt]]
  const result = chars.join('')
  frames.push({ phase: 'done', activeLine: L('return the resulting string'), index: swapAt, text: result, message: swapAt >= 0 ? `Result: ${result}.` : `No swap helps, so the result is ${result}.` })
  return { input: s, result, frames }
}

export const code = `lexicographically smallest string after at most one swap:
  for each adjacent pair from left to right, do
    if the digits have the same parity and the left digit is larger then
      swap them and stop searching
  return the resulting string`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def smallest_after_swap(s):
    chars = list(s)
    for i in range(len(chars) - 1):
        same_parity = int(chars[i]) % 2 == int(chars[i + 1]) % 2
        if same_parity and chars[i] > chars[i + 1]:
            chars[i], chars[i + 1] = chars[i + 1], chars[i]
            break
    return ''.join(chars)
`
