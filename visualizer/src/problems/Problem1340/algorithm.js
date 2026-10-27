export function parseInput(text) {
  const data = JSON.parse(text)
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Use an object with arr and d.')
  const { arr, d } = data
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > 12) throw new Error('arr must be an array of 1 to 12 integers.')
  if (arr.some(v => !Number.isInteger(v) || v < 1 || v > 100000)) throw new Error('Each arr value is an integer from 1 to 100000.')
  if (!Number.isInteger(d) || d < 1 || d > arr.length) throw new Error('d is an integer from 1 to the length of arr.')
  return { arr, d }
}

export function buildTrace(input) {
  const { arr, d } = input
  const n = arr.length
  const memo = new Map()
  const entries = []
  const snapshot = () => entries.map(e => ({ ...e }))
  const frames = [{ phase: 'start', activeLine: L('set result to 0'), index: null, targets: [], memo: [], message: 'Find the longest chain of jumps from every starting index.' }]

  // Indices reachable in one jump: at most d steps away, all values strictly below arr[i] on the way and at the target.
  const targetsOf = i => {
    const out = []
    for (const dir of [1, -1]) {
      for (let step = 1; step <= d; step++) {
        const j = i + dir * step
        if (j < 0 || j >= n || arr[j] >= arr[i]) break
        out.push(j)
      }
    }
    return out
  }

  const chain = i => {
    if (memo.has(i)) {
      const value = memo.get(i)
      frames.push({ phase: 'reuse', activeLine: L('if memo already holds'), index: i, targets: [], memo: snapshot(), message: `Index ${i} already has a chain of ${value}.` })
      return value
    }
    let best = 1
    const targets = targetsOf(i)
    frames.push({ phase: 'visit', activeLine: L('set best to 1'), index: i, targets, memo: snapshot(), message: `From index ${i} (value ${arr[i]}) the jumps reach ${targets.length ? targets.join(', ') : 'nothing'}.` })
    for (const j of targets) {
      best = Math.max(best, 1 + chain(j))
    }
    memo.set(i, best)
    entries.push({ index: i, value: best })
    frames.push({ phase: 'store', activeLine: L('store best for i'), index: i, targets: [], memo: snapshot(), message: `Chain from index ${i} is ${best}.` })
    return best
  }

  let result = 0
  for (let i = 0; i < n; i++) {
    result = Math.max(result, chain(i))
  }
  frames.push({ phase: 'done', activeLine: L('return result'), index: null, targets: [], memo: snapshot(), message: `Most indices visited in one walk: ${result}.` })
  return { input, result, frames }
}

export const code = `most indices visited in one walk
  set result to 0
  for each index i
    set result to the larger of result and chain(i)
  return result

chain(i)
  if memo already holds a value for i then return it
  set best to 1
  for each index j that can be jumped to from i
    set best to the larger of best and 1 plus chain(j)
  store best for i and return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def jump_game_v(arr, d):
    n = len(arr)
    memo = {}

    def chain(i):
        if i in memo:
            return memo[i]
        best = 1
        for direction in (1, -1):
            for step in range(1, d + 1):
                j = i + direction * step
                if j < 0 or j >= n or arr[j] >= arr[i]:
                    break
                best = max(best, 1 + chain(j))
        memo[i] = best
        return best

    result = 0
    for i in range(n):
        result = max(result, chain(i))
    return result
`
