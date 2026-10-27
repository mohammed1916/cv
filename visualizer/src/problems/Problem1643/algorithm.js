export function parseInput(text) {
  const data = JSON.parse(text)
  const { destination, k } = data ?? {}
  if (!Array.isArray(destination) || destination.length !== 2 || destination.some(v => !Number.isInteger(v) || v < 1 || v > 6)) throw new Error('destination is [rows, columns] with integers from 1 to 6.')
  const [rows, cols] = destination
  const total = binomial(rows + cols, rows)
  if (!Number.isInteger(k) || k < 1 || k > total) throw new Error(`k must be an integer from 1 to ${total}.`)
  return { destination, k }
}

function binomial(n, r) {
  let value = 1
  for (let i = 1; i <= r; i++) value = (value * (n - r + i)) / i
  return Math.round(value)
}

export const code = `kth smallest instruction(destination, k)
  set rows to the number of V moves and cols to the number of H moves
  while moves remain
    count the paths that start with H (zero when no H is left)
    if H moves remain and k is at most that count
      append H, and use one H move
    otherwise
      subtract that count from k, append V, and use one V move
  return the path`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

// H sorts before V. The paths that start with H number C(h-1+v, v), so that count decides each move.
export function buildTrace({ destination, k }) {
  let [v, h] = destination
  const total = v + h
  let rank = k
  let path = ''
  const frames = [{ phase: 'start', path, k: rank, activeLine: L('set rows to'), message: `Build the ${k}-th path in dictionary order, with ${v} V and ${h} H moves.` }]
  while (v > 0 || h > 0) {
    const ways = h > 0 ? binomial(h - 1 + v, v) : 0
    if (h > 0 && rank <= ways) {
      path += 'H'
      h--
      frames.push({ phase: 'H', path, k: rank, ways, activeLine: L('append H'), message: `${ways} paths start with H, and k = ${rank} is within them, so the next move is H.` })
    } else {
      rank -= ways
      path += 'V'
      v--
      frames.push({ phase: 'V', path, k: rank, ways, activeLine: L('subtract that count'), message: `${ways} paths start with H, so k drops to ${rank} and the next move is V.` })
    }
  }
  frames.push({ phase: 'done', path, k: rank, activeLine: L('return the path'), result: path, message: `The ${k}-th smallest instruction is ${path}.` })
  return { input: { destination, k }, total, result: path, frames }
}

export const python = `from math import comb

def kth_smallest_path(destination, k):
    v, h = destination
    out = []
    while v > 0 or h > 0:
        ways = comb(h - 1 + v, v) if h > 0 else 0
        if h > 0 and k <= ways:
            out.append('H')
            h -= 1
        else:
            k -= ways
            out.append('V')
            v -= 1
    return ''.join(out)
`
