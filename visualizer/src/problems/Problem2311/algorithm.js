export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).sort().join() !== 'k,s') throw new Error('Use a JSON object with keys s and k: {"s": "1001010", "k": 5}.')
  if (typeof input.s !== 'string' || !/^[01]{1,20}$/.test(input.s)) throw new Error('s must be 1 to 20 binary digits.')
  if (!Number.isInteger(input.k) || input.k < 1 || input.k > 1000000) throw new Error('k must be an integer from 1 to 1000000.')
  return { s: input.s, k: input.k }
}

export function buildTrace(input) {
  const { s, k } = input
  let value = 0
  let length = 0
  let stopped = false
  const frames = [{ phase: 'start', activeLine: L('set value to zero'), index: -1, bit: '', value, length, kept: 0, message: `Read the bits from the right end. A one is kept only while the value stays at most ${k}.` }]
  for (let i = s.length - 1; i >= 0; i--) {
    const bit = s[i]
    if (bit === '1' && value + 2 ** length > k) {
      stopped = true
      frames.push({ phase: 'stop', activeLine: L('stop the scan'), index: i, bit, value, length, kept: length, message: `The one at ${i} would raise the value to ${value + 2 ** length}, above ${k}. Stop the scan here.` })
      break
    }
    if (bit === '1') value += 2 ** length
    length += 1
    frames.push({ phase: 'scan', activeLine: L('add one to length'), index: i, bit, value, length, kept: length, message: `Keep bit ${bit} at ${i}. Value ${value}, kept length ${length}.` })
  }
  const zeros = stopped ? [...s.slice(0, frames.at(-1).index)].filter(c => c === '0').length : 0
  const result = length + zeros
  frames.push({ phase: 'done', activeLine: L('return length'), index: -1, bit: '', value, length: result, kept: length, message: `The longest subsequence has length ${result}.` })
  return { input: { s, k }, result, frames }
}

export const code = `Longest binary subsequence at most k
set value to zero and length to zero
scan the bits from the right end toward the left end
  if the bit is one and value plus two to the power of length is more than k then
    stop the scan at this bit
  if the bit is one then add two to the power of length to value
  add one to length
if the scan stopped at a bit then add the zeros to the left of that bit to length
return length`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_binary_subsequence(s, k):
    value = 0
    length = 0
    for i in range(len(s) - 1, -1, -1):
        if s[i] == '1':
            if value + (1 << length) > k:
                return length + s[:i].count('0')
            value += 1 << length
        length += 1
    return length
`
