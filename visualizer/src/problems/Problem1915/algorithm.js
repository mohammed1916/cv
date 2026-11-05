// LeetCode 1915: a substring is wonderful when at most one letter has an odd count. Prefix parity masks turn that into: two prefixes whose masks differ in zero or one bit.
const SOURCE = [
  "function wonderfulSubstrings(word) {",
  "  const count = new Array(1024).fill(0)",
  "  count[0] = 1",
  "  let mask = 0, answer = 0",
  "  for (const ch of word) {",
  "    mask ^= 1 << (ch.charCodeAt(0) - 97)",
  "    answer += count[mask]",
  "    for (let bit = 0; bit < 10; bit++) answer += count[mask ^ (1 << bit)]",
  "    count[mask] += 1",
  "  }",
  "  return answer",
  "}",
]

export const code = SOURCE.map((text, index) => ({ line: index + 1, text }))

export const python = `def wonderful_substrings(word):
    count = [0] * 1024
    count[0] = 1
    mask = 0
    answer = 0
    for ch in word:
        mask ^= 1 << (ord(ch) - ord("a"))
        answer += count[mask]
        for bit in range(10):
            answer += count[mask ^ (1 << bit)]
        count[mask] += 1
    return answer
`

const L = text => { const i = SOURCE.findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no code line: ${text}`); return i + 1 }
const P = text => { const i = python.split('\n').findIndex(line => line.includes(text)); if (i < 0) throw new Error(`no python line: ${text}`); return i + 1 }

export const phases = [
  { id: 'scan', label: 'Scan', description: 'Update the parity mask and count matching earlier prefixes.' },
  { id: 'done', label: 'Result', description: 'Wonderful substrings found.' },
]

export function parseInput(text) {
  const s = String(text).trim()
  if (!/^[a-j]{1,16}$/.test(s)) throw new Error('Enter 1 to 16 letters from a to j.')
  return { word: s }
}

const bits = mask => mask.toString(2).padStart(10, '0')

export function buildTrace({ word }) {
  const count = new Map([[0, 1]])
  let mask = 0, answer = 0
  const frames = []
  for (let i = 0; i < word.length; i++) {
    const ch = word[i]
    mask ^= 1 << (ch.charCodeAt(0) - 97)
    const same = count.get(mask) || 0
    answer += same
    let oneOff = 0
    for (let bit = 0; bit < 10; bit++) oneOff += count.get(mask ^ (1 << bit)) || 0
    answer += oneOff
    count.set(mask, same + 1)
    frames.push({ phase: 'scan', activeLine: L('mask ^= 1 <<'), pythonLine: P('mask ^= 1'), message: `After "${word[i]}", the parity mask is ${bits(mask)}. Found ${same} equal and ${oneOff} one-bit-apart earlier prefixes.`, i, ch, mask: bits(mask), same, oneOff, answer, counts: Object.fromEntries([...count].map(([k, v]) => [bits(k), v])) })
  }
  frames.push({ phase: 'done', activeLine: L('return answer'), pythonLine: P('return answer'), message: `${answer} wonderful substring(s).`, i: -1, ch: null, mask: null, same: 0, oneOff: 0, answer, counts: Object.fromEntries([...count].map(([k, v]) => [bits(k), v])), result: answer })
  return { input: { word }, result: answer, frames }
}
