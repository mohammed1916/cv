export function parseInput(text) {
  const data = JSON.parse(text)
  const { n, k } = data ?? {}
  if (!Number.isInteger(n) || n < 0 || n > 255) throw new Error('"n" is an integer from 0 to 255 in this visualization.')
  if (!Number.isInteger(k) || k < 0 || k > 255) throw new Error('"k" is an integer from 0 to 255 in this visualization.')
  return { n, k }
}

export function buildTrace({ n, k }) {
  let changes = 0
  let result = null
  const frames = [{ phase: 'start', activeLine: L('set changes to 0'), bit: -1, changes, message: `Compare ${n} and ${k} bit by bit.` }]
  for (let bit = 0; bit < 8; bit++) {
    const nb = (n >> bit) & 1
    const kb = (k >> bit) & 1
    if (kb && !nb) {
      result = -1
      frames.push({ phase: 'impossible', activeLine: L('n has a set bit that k lacks'), bit, changes, message: `Bit ${bit} is set in k but not in n, and a change can only clear a bit. The answer is -1.` })
      break
    }
    if (nb && !kb) changes++
    frames.push({ phase: 'bit', activeLine: L('n has a set bit that k lacks'), bit, changes, message: nb && !kb ? `Bit ${bit} is set in n only: one change clears it.` : `Bit ${bit} already matches.` })
  }
  if (result === null) result = changes
  frames.push({ phase: 'done', activeLine: L('return changes'), bit: -1, changes, message: `Answer: ${result}.` })
  return { input: { n, k }, result, frames }
}

export const code = `minimum changes that turn n into k, where a change clears one set bit of n
  set changes to 0
  for each bit position from 0 to 7
    if k has a set bit that n lacks then return -1, since a change can only clear a bit
    if n has a set bit that k lacks then add 1 to changes
  return changes`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def bit_changes(n, k):
    changes = 0
    for bit in range(max(n, k).bit_length()):
        nb = (n >> bit) & 1
        kb = (k >> bit) & 1
        if kb and not nb:
            return -1
        if nb and not kb:
            changes += 1
    return changes
`
