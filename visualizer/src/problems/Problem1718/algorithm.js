export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Number.isInteger(input.n)) throw new Error('Use an object with an integer "n".')
  const { n } = input
  if (n < 1 || n > 10) throw new Error('n is an integer from 1 to 10.')
  return { n }
}

export function buildTrace(input) {
  const { n } = input
  const size = 2 * n - 1
  const seq = new Array(size).fill(0)
  const used = new Array(n + 1).fill(false)
  const frames = [{ phase: 'start', pythonLine: 3, activeLine: L('const seq = new Array'), index: 0, value: 0, seq: [...seq], message: `Fill ${size} slots from left to right, trying the largest value first.` }]
  const place = index => {
    if (index === size) return true
    if (seq[index] !== 0) return place(index + 1)
    for (let k = n; k >= 1; k--) {
      if (used[k]) continue
      const second = k === 1 ? index : index + k
      if (second >= size || seq[second] !== 0) continue
      seq[index] = k
      seq[second] = k
      used[k] = true
      frames.push({ phase: 'place', pythonLine: 19, activeLine: L('used[k] = true'), index, value: k, seq: [...seq], message: `Place ${k} at ${index}${k === 1 ? '' : ` and ${second}`}.` })
      if (place(index + 1)) return true
      seq[index] = 0
      seq[second] = 0
      used[k] = false
      frames.push({ phase: 'undo', pythonLine: 24, activeLine: L('seq[index] = 0'), index, value: k, seq: [...seq], message: `No completion with ${k} at ${index}, so clear it and try a smaller value.` })
    }
    return false
  }
  place(0)
  frames.push({ phase: 'done', pythonLine: 28, activeLine: L('return seq'), index: size, value: 0, seq: [...seq], message: `Sequence: [${seq.join(', ')}].` })
  return { input, result: seq, frames }
}

export const code = `function lexLargestSequence(n) {
  const size = 2 * n - 1
  const seq = new Array(size).fill(0)
  const used = new Array(n + 1).fill(false)
  const place = index => {
    if (index === size) return true
    if (seq[index] !== 0) return place(index + 1)
    for (let k = n; k >= 1; k--) {
      if (used[k]) continue
      const second = k === 1 ? index : index + k
      if (second >= size || seq[second] !== 0) continue
      seq[index] = k
      seq[second] = k
      used[k] = true
      if (place(index + 1)) return true
      seq[index] = 0
      seq[second] = 0
      used[k] = false
    }
    return false
  }
  place(0)
  return seq
}`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def lex_largest_sequence(n):
    size = 2 * n - 1
    seq = [0] * size
    used = [False] * (n + 1)

    def place(index):
        if index == size:
            return True
        if seq[index] != 0:
            return place(index + 1)
        for k in range(n, 0, -1):
            if used[k]:
                continue
            second = index if k == 1 else index + k
            if second >= size or seq[second] != 0:
                continue
            seq[index] = k
            seq[second] = k
            used[k] = True
            if place(index + 1):
                return True
            seq[index] = 0
            seq[second] = 0
            used[k] = False
        return False

    place(0)
    return seq
`
