// LeetCode 2106: Maximum Fruits Harvested After at Most K Steps.
// A harvested stretch is a contiguous range of fruit positions [pos[i], pos[j]] that contains the start.
// Reaching it costs min(2*leftDistance + rightDistance, leftDistance + 2*rightDistance); keep that within k.
// Two pointers: as i moves right, the furthest affordable j never moves left.

export function parseInput(text) {
  let data
  try { data = JSON.parse(text) } catch { throw new Error('Use a JSON object such as {"fruits":[[2,8],[6,3]],"startPos":5,"k":4}.') }
  const { fruits, startPos, k } = data ?? {}
  if (!Array.isArray(fruits) || fruits.length < 1 || fruits.length > 20) throw new Error('fruits must hold 1 to 20 [position, amount] pairs.')
  for (let i = 0; i < fruits.length; i++) {
    const [position, amount] = fruits[i]
    if (!Number.isInteger(position) || !Number.isInteger(amount) || amount < 1 || position < 0 || position > 60) throw new Error('Positions are integers from 0 to 60 and amounts are at least 1.')
    if (i > 0 && position <= fruits[i - 1][0]) throw new Error('Positions must be strictly increasing.')
  }
  if (!Number.isInteger(startPos) || startPos < 0 || startPos > 60 || !Number.isInteger(k) || k < 0 || k > 60) throw new Error('startPos and k are integers from 0 to 60.')
  return { fruits, startPos, k }
}

export const code = `function maxFruits(fruits, startPos, k) {
  const n = fruits.length
  const prefix = [0]
  for (const [, amount] of fruits) prefix.push(prefix.at(-1) + amount)
  const cost = (i, j) => {
    const left = Math.max(0, startPos - fruits[i][0])
    const right = Math.max(0, fruits[j][0] - startPos)
    return Math.min(2 * left + right, left + 2 * right)
  }
  let best = 0
  let j = 0
  for (let i = 0; i < n; i++) {
    j = Math.max(j, i - 1)
    while (j + 1 < n && cost(i, j + 1) <= k) j++
    if (j >= i && cost(i, j) <= k) best = Math.max(best, prefix[j + 1] - prefix[i])
  }
  return best
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `# entry: max_fruits
def max_fruits(fruits, startPos, k):
    n = len(fruits)
    prefix = [0]
    for _, amount in fruits:
        prefix.append(prefix[-1] + amount)

    def cost(i, j):
        left = max(0, startPos - fruits[i][0])
        right = max(0, fruits[j][0] - startPos)
        return min(2 * left + right, left + 2 * right)

    best = 0
    j = 0
    for i in range(n):
        j = max(j, i - 1)
        while j + 1 < n and cost(i, j + 1) <= k:
            j += 1
        if j >= i and cost(i, j) <= k:
            best = max(best, prefix[j + 1] - prefix[i])
    return best
`

const L = text => {
  const index = code.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing pseudocode line: ${text}`)
  return index + 1
}
const P = text => {
  const index = python.split('\n').findIndex(line => line.includes(text))
  if (index < 0) throw new Error(`Missing python line: ${text}`)
  return index + 1
}

export const phases = [
  { id: 'start', label: 'Prefix sums', description: 'Prefix sums give the fruit total of any run of positions in one step.' },
  { id: 'expand', label: 'Extend right', description: 'Move the right end j while the cost of reaching it stays within k.' },
  { id: 'record', label: 'Record', description: 'The fruit between the ends is a candidate answer.' },
  { id: 'shift', label: 'Drop left', description: 'Move the left end i right; the affordable right end never moves back.' },
  { id: 'done', label: 'Result', description: 'The best total over all left ends.' },
]

export function buildTrace({ fruits, startPos, k }) {
  const frames = []
  const n = fruits.length
  const prefix = [0]
  for (const [, amount] of fruits) prefix.push(prefix.at(-1) + amount)
  const cost = (i, j) => {
    const left = Math.max(0, startPos - fruits[i][0])
    const right = Math.max(0, fruits[j][0] - startPos)
    return Math.min(2 * left + right, left + 2 * right)
  }
  let best = 0
  let bestRange = null
  let j = 0
  frames.push({ phase: 'start', activeLine: L('const prefix = [0]'), pythonLine: P('prefix = [0]'), message: `Start at ${startPos} with ${k} steps. Prefix sums are ready.`, i: -1, j: -1, marks: {}, best, cost: null })
  for (let i = 0; i < n; i++) {
    j = Math.max(j, i - 1)
    while (j + 1 < n && cost(i, j + 1) <= k) {
      j++
      frames.push({ phase: 'expand', activeLine: L('while (j + 1 < n'), pythonLine: P('while j + 1 < n'), message: `Reaching positions ${fruits[i][0]} to ${fruits[j][0]} costs ${cost(i, j)}, within ${k}.`, i, j, marks: { [i]: 'l', [j]: 'r' }, best, cost: cost(i, j) })
    }
    if (j >= i && cost(i, j) <= k) {
      const total = prefix[j + 1] - prefix[i]
      if (total > best) { best = total; bestRange = [i, j] }
      frames.push({ phase: 'record', activeLine: L('best = Math.max'), pythonLine: P('best = max'), message: `Positions ${fruits[i][0]} to ${fruits[j][0]} give ${total} fruits; best so far ${best}.`, i, j, marks: { [i]: 'l', [j]: 'r' }, best, cost: cost(i, j) })
    } else {
      frames.push({ phase: 'shift', activeLine: L('for (let i = 0'), pythonLine: P('for i in range'), message: `Fruit at ${fruits[i][0]} alone is out of reach; move on.`, i, j, marks: { [i]: 'l' }, best, cost: null })
    }
    frames.push({ phase: 'shift', activeLine: L('for (let i = 0'), pythonLine: P('for i in range'), message: `Left end moves past ${fruits[i][0]}.`, i: i + 1, j, marks: j >= i + 1 ? { [i + 1]: 'l', [j]: 'r' } : {}, best, cost: null })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), pythonLine: P('return best'), message: `The most fruit reachable is ${best}${bestRange ? ` (positions ${fruits[bestRange[0]][0]} to ${fruits[bestRange[1]][0]})` : ''}.`, i: -1, j: -1, marks: {}, best, cost: null })
  return { input: { fruits, startPos, k }, result: best, frames }
}
