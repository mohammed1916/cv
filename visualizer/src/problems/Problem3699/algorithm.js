const MOD = 1000000007

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, l and r.')
  if (Object.keys(input).sort().join(',') !== 'l,n,r') throw new Error('The object must have exactly the keys n, l and r.')
  const { n, l, r } = input
  if (!Number.isInteger(n) || n < 3 || n > 12) throw new Error('Use n from 3 to 12 for this visualization.')
  if (!Number.isInteger(l) || !Number.isInteger(r) || l < 1 || l >= r || r > 12) throw new Error('Use integers with 1 <= l < r <= 12.')
  return { n, l, r }
}

export function buildTrace(input) {
  const { n, l, r } = input
  const values = []
  for (let v = l; v <= r; v++) values.push(v)
  // up[k] and down[k] count arrays whose last step went up or down and that end at values[k].
  let up = values.map(v => v - l)
  let down = values.map(v => r - v)
  const frames = [{ phase: 'start', activeLine: L('count the arrays of length 2'), length: 2, values, up: [...up], down: [...down], total: null, message: `Arrays of length 2: ${up.reduce((a, b) => a + b, 0) + down.reduce((a, b) => a + b, 0)}.` }]
  for (let length = 3; length <= n; length++) {
    const nextUp = []
    let run = 0
    for (let k = 0; k < values.length; k++) {
      nextUp.push(run)
      run = (run + down[k]) % MOD
    }
    const nextDown = new Array(values.length).fill(0)
    run = 0
    for (let k = values.length - 1; k >= 0; k--) {
      nextDown[k] = run
      run = (run + up[k]) % MOD
    }
    up = nextUp
    down = nextDown
    frames.push({ phase: 'extend', activeLine: L('compute the new up counts'), length, values, up: [...up], down: [...down], total: null, message: `Arrays of length ${length} updated for every last value.` })
  }
  const result = (up.reduce((a, b) => (a + b) % MOD, 0) + down.reduce((a, b) => (a + b) % MOD, 0)) % MOD
  frames.push({ phase: 'done', activeLine: L('return the sum of all up and down counts'), length: n, values, up: [...up], down: [...down], total: result, message: `Zigzag arrays of length ${n}: ${result}.` })
  return { input, result, frames }
}

export const code = `count zigzag arrays of length n with values from l to r
  for each value v, count the arrays of length 2 that end at v going up and going down
  repeat n minus 2 times
    compute the new up counts from the down counts of smaller values
    compute the new down counts from the up counts of larger values
  return the sum of all up and down counts modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def number_of_zigzag_arrays_i(n, l, r):
    MOD = 10**9 + 7
    values = list(range(l, r + 1))
    up = [v - l for v in values]
    down = [r - v for v in values]
    for _ in range(n - 2):
        new_up = []
        run = 0
        for k in range(len(values)):
            new_up.append(run)
            run = (run + down[k]) % MOD
        new_down = [0] * len(values)
        run = 0
        for k in reversed(range(len(values))):
            new_down[k] = run
            run = (run + up[k]) % MOD
        up, down = new_up, new_down
    return (sum(up) + sum(down)) % MOD
`
