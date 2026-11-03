const MOD = 1000000007

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, l and r.')
  const { n, l, r } = input
  if (!Number.isInteger(n) || n < 1 || n > 8) throw new Error('n is an integer from 1 to 8.')
  if (!Number.isInteger(l) || !Number.isInteger(r) || l < 1 || r < l || r - l > 5) throw new Error('Use integers 1 <= l <= r with r - l at most 5.')
  return { n, l, r }
}

// A zigzag array alternates up and down steps. Track, for each value, how many prefixes end there with the last
// step up and how many with the last step down. A new up step into v needs a previous down step into the
// smaller value, and a new down step needs a previous up step from a larger value.
export function buildTrace({ n, l, r }) {
  const m = r - l + 1
  const frames = []
  const snap = extra => ({ up: [], down: [], length: 1, value: null, total: null, ...extra })
  const sumOf = arr => arr.reduce((a, b) => (a + b) % MOD, 0)
  let up = Array.from({ length: m }, () => 0)
  let down = Array.from({ length: m }, () => 0)
  frames.push(snap({ pythonLine: PY('if n == 1:'), phase: 'start', activeLine: L('up[v] = number of prefixes'), up: [], down: [], length: 1, value: null, total: m, message: `Length 1: any of the ${m} values.` }))
  if (n === 1) {
    frames.push(snap({ pythonLine: PY('return m % MOD'), phase: 'done', activeLine: L('return the sum of all up'), length: 1, total: m, message: `Total: ${m}.` }))
    return { input: { n, l, r }, result: m % MOD, frames }
  }
  for (let v = 0; v < m; v += 1) {
    up[v] = v
    down[v] = m - 1 - v
  }
  frames.push(snap({ pythonLine: PY('up = [v for v'), phase: 'length', activeLine: L('up[v] = number of prefixes'), up: up.slice(), down: down.slice(), length: 2, value: null, total: sumOf([...up, ...down]), message: 'Length 2: up into v counts the smaller values; down counts the larger ones.' }))
  for (let len = 3; len <= n; len += 1) {
    const newUp = Array(m).fill(0)
    const newDown = Array(m).fill(0)
    for (let v = 0; v < m; v += 1) {
      let a = 0
      for (let u = 0; u < v; u += 1) a = (a + down[u]) % MOD
      newUp[v] = a
      frames.push(snap({ pythonLine: PY('new_up[v] = sum'), phase: 'up', activeLine: L('new_up[v] = sum of down'), up: newUp.slice(), down: down.slice(), length: len, value: v, total: null, message: `Length ${len}, value ${l + v}: last step up sums the down counts of smaller values; ${a}.` }))
      let b = 0
      for (let u = v + 1; u < m; u += 1) b = (b + up[u]) % MOD
      newDown[v] = b
      frames.push(snap({ pythonLine: PY('new_down[v] = sum'), phase: 'down', activeLine: L('new_down[v] = sum of up'), up: newUp.slice(), down: newDown.slice(), length: len, value: v, total: null, message: `Length ${len}, value ${l + v}: last step down sums the up counts of larger values; ${b}.` }))
    }
    up = newUp
    down = newDown
  }
  const total = sumOf([...up, ...down])
  frames.push(snap({ pythonLine: PY('return (sum(up)'), phase: 'done', activeLine: L('return the sum of all up'), up: up.slice(), down: down.slice(), length: n, value: null, total, message: `Total zigzag arrays of length ${n}: ${total}.` }))
  return { input: { n, l, r }, result: total, frames }
}

export const code = `count zigzag arrays of length n with values from l to r
  m = number of values from l to r
  if n is 1 return m
  up[v] = number of prefixes of length 2 ending at v with a rise
  down[v] = number of prefixes of length 2 ending at v with a fall
  repeat n minus 2 times
    new_up[v] = sum of down[u] for u less than v
    new_down[v] = sum of up[u] for u greater than v
  return the sum of all up and down counts modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def zigzag_count(n, l, r):
    MOD = 1000000007
    m = r - l + 1
    if n == 1:
        return m % MOD
    up = [v for v in range(m)]
    down = [m - 1 - v for v in range(m)]
    for _ in range(n - 2):
        new_up = [0] * m
        new_down = [0] * m
        for v in range(m):
            new_up[v] = sum(down[u] for u in range(v)) % MOD
            new_down[v] = sum(up[u] for u in range(v + 1, m)) % MOD
        up, down = new_up, new_down
    return (sum(up) + sum(down)) % MOD
`

const PY = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}
