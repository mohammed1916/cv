export const code = [
  'count the ones and zeros in t',
  'for each position i from left to right',
  'want a digit that makes the XOR bit one',
  'use the wanted digit when one is left, else the other',
  'append the XOR of s[i] and the chosen digit',
  'return the result',
].map((text, index) => ({ line: index + 1, text }))
const L = key => code.findIndex(c => c.text.includes(key)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with s and t.')
  const { s, t } = input
  if (typeof s !== 'string' || typeof t !== 'string' || s.length < 1 || s.length > 16 || s.length !== t.length || !/^[01]+$/.test(s) || !/^[01]+$/.test(t)) {
    throw new Error('s and t are binary strings of the same length from 1 to 16.')
  }
  return { s, t }
}

export function buildTrace({ s, t }) {
  let ones = [...t].filter(c => c === '1').length
  let zeros = t.length - ones
  const chosen = []
  const result = []
  const frames = [{ i: -1, chosen: [], result: [], ones, zeros, phase: 'setup', activeLine: L('count the ones'), message: `t has ${ones} ones and ${zeros} zeros.` }]
  for (let i = 0; i < s.length; i++) {
    const want = s[i] === '0' ? '1' : '0'
    const wantAvailable = want === '1' ? ones > 0 : zeros > 0
    const pick = wantAvailable ? want : (want === '1' ? '0' : '1')
    if (pick === '1') ones--
    else zeros--
    chosen.push(pick)
    result.push(String(Number(s[i]) ^ Number(pick)))
    frames.push({ i, chosen: [...chosen], result: [...result], ones, zeros, phase: 'position', activeLine: L('want a digit'),
      message: `Position ${i}: s has ${s[i]}, wanted ${want}, used ${pick}, result bit ${result[i]}.` })
  }
  const answer = result.join('')
  frames.push({ i: s.length, chosen: [...chosen], result: [...result], ones, zeros, phase: 'done', activeLine: L('return the result'), message: `Maximum XOR is ${answer}.` })
  return { input: { s, t }, result: answer, frames }
}

export const python = `def max_xor_after_rearrangement(s, t):
    ones = t.count('1')
    zeros = len(t) - ones
    out = []
    for bit in s:
        want = '1' if bit == '0' else '0'
        if (want == '1' and ones > 0) or (want == '0' and zeros > 0):
            pick = want
        else:
            pick = '0' if want == '1' else '1'
        if pick == '1':
            ones -= 1
        else:
            zeros -= 1
        out.append(str(int(bit) ^ int(pick)))
    return ''.join(out)`
