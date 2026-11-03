const codeLines = `set best to 0
for each window [l, r] of s
  ones = number of 1s in the window, zeros = length minus ones
  outside ones and zeros are the counts outside the window
  if ones equals zeros then the window is balanced without a swap
  else if the gap is 2 and a matching character lies outside, one swap fixes it
  if the window is fixable then best = max(best, length)
return best`.split('\n').map((text, index) => ({ line: index + 1, text: text.trim() }))
const L = s => codeLines.findIndex(c => c.text.includes(s)) + 1
const pythonLines = `def longest_balanced(s):
    n = len(s)
    total1 = s.count('1')
    total0 = n - total1
    best = 0
    for l in range(n):
        for r in range(l, n):
            ones = s[l:r + 1].count('1')
            zeros = (r - l + 1) - ones
            out1 = total1 - ones
            out0 = total0 - zeros
            gap = ones - zeros
            if gap == 0 or (gap == 2 and out0 >= 1) or (gap == -2 and out1 >= 1):
                best = max(best, r - l + 1)
    return best`.split('\n')
const P = s => pythonLines.findIndex(t => t.includes(s)) + 1

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input.s !== 'string') throw new Error('Use an object with s, a binary string.')
  const { s } = input
  if (s.length < 1 || s.length > 20) throw new Error('s has 1 to 20 characters in this visual.')
  if (!/^[01]+$/.test(s)) throw new Error('s uses only 0 and 1.')
  return { s }
}

export function buildTrace({ s }) {
  const n = s.length
  const total1 = [...s].filter(c => c === '1').length
  const total0 = n - total1
  const frames = [{ phase: 'totals', activeLine: L('set best to 0'), pythonLine: P('total1 = '), l: -1, r: -1, fixable: null, best: 0,
    message: `${total1} ones and ${total0} zeros in the whole string.` }]
  let best = 0
  let bestWindow = null
  for (let l = 0; l < n; l++) {
    for (let r = l; r < n; r++) {
      const window = s.slice(l, r + 1)
      const ones = [...window].filter(c => c === '1').length
      const zeros = window.length - ones
      const out1 = total1 - ones
      const out0 = total0 - zeros
      const gap = ones - zeros
      const fixable = gap === 0 || (gap === 2 && out0 >= 1) || (gap === -2 && out1 >= 1)
      if (fixable && window.length > best) { best = window.length; bestWindow = [l, r] }
      frames.push({ phase: 'window', activeLine: L('ones = number'), pythonLine: P('ones = s[l'), l, r, fixable, best,
        message: `[${l}..${r}]: ${ones} ones, ${zeros} zeros, ${fixable ? 'fixable' : 'not fixable'}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: P('return best'), l: bestWindow ? bestWindow[0] : -1, r: bestWindow ? bestWindow[1] : -1, fixable: true, best,
    message: `Longest balanced substring after one swap: ${best}.` })
  return { input: { s }, result: best, frames }
}

export const code = codeLines
export const python = pythonLines.join('\n')
