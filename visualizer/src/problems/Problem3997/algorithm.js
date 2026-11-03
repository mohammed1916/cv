export const code = `count the nodes whose value equals the largest value in their own subtree
  set count to 0 and subtree maxima to an empty array of the same size
  for node index i from the last index down to 0
    set best to the value at i
    if the left child exists, set best to the larger of best and the left child's maximum
    if the right child exists, set best to the larger of best and the right child's maximum
    store best as the subtree maximum at i
    if the value at i equals best then add one to count
  return count`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = text => {
  const at = code.findIndex(c => c.text.includes(text))
  if (at < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return at + 1
}

export const python = `def count_dominant_nodes(values):
    n = len(values)
    best = [0] * n
    count = 0
    for i in range(n - 1, -1, -1):
        m = values[i]
        for child in (2 * i + 1, 2 * i + 2):
            if child < n:
                m = max(m, best[child])
        best[i] = m
        if values[i] == m:
            count += 1
    return count
`
const pyLines = python.split('\n')
const P = text => {
  const at = pyLines.findIndex(line => line.includes(text))
  if (at < 0) throw new Error(`Missing python line: ${text}`)
  return at + 1
}

export function parseInput(text) {
  const values = JSON.parse(text)
  if (!Array.isArray(values) || values.length < 1 || values.length > 15) throw new Error('Use a level-order array of 1 to 15 integers.')
  if (!values.every(v => Number.isInteger(v) && v >= 1 && v <= 20)) throw new Error('Values are integers from 1 to 20.')
  return values
}

export function buildTrace(values) {
  const n = values.length
  const best = Array(n).fill(0)
  const frames = []
  let count = 0
  frames.push({ pythonLine: P('best = [0] * n'), phase: 'start', activeLine: L('set count to 0'), at: -1, best: [...best], dominant: [], count, message: `Walk ${n} nodes from the bottom up.` })
  const dominant = new Set()
  for (let i = n - 1; i >= 0; i--) {
    let m = values[i]
    const kids = []
    for (const child of [2 * i + 1, 2 * i + 2]) {
      if (child < n) {
        kids.push(child)
        m = Math.max(m, best[child])
      }
    }
    best[i] = m
    const isDom = values[i] === m
    if (isDom) { count += 1; dominant.add(i) }
    frames.push({ pythonLine: P('best[i] = m'), phase: 'node', activeLine: L('if the value at i equals best'), at: i, kids, best: [...best], dominant: [...dominant], count, isDom,
      message: `Node ${i} (value ${values[i]}) has subtree maximum ${m}; ${isDom ? 'it is dominant.' : 'a larger value sits below it.'}` })
  }
  frames.push({ pythonLine: P('return count'), phase: 'done', activeLine: L('return count'), at: -1, best: [...best], dominant: [...dominant], count, message: `${count} dominant node${count === 1 ? '' : 's'} found.` })
  return { input: values, result: count, frames }
}
