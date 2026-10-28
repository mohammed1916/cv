const MOD = 1000000007

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with n, l and r.')
  if (Object.keys(input).sort().join(',') !== 'l,n,r') throw new Error('The object must have exactly the keys n, l and r.')
  const { n, l, r } = input
  if (!Number.isInteger(n) || n < 3 || n > 12) throw new Error('Use n from 3 to 12 for this visualization.')
  if (!Number.isInteger(l) || !Number.isInteger(r) || l < 1 || l >= r || r > 12) throw new Error('Use integers with 1 <= l < r <= 12 for this visualization.')
  return { n, l, r }
}

export function buildTrace(input) {
  const { n, l, r } = input
  const values = []
  for (let v = l; v <= r; v++) values.push(v)
  // up[k] and down[k] count arrays whose last step went up or down and that end at values[k].
  let up = values.map(v => v - l)
  let down = values.map(v => r - v)
  const frames = [{ phase: 'start', activeLine: L('count the arrays of length 2'), length: 2, values, up: [...up], down: [...down], total: null, message: 'Arrays of length 2 are counted by their last value and last step.' }]
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
    frames.push({ phase: 'extend', activeLine: L('build the transition that turns'), length, values, up: [...up], down: [...down], total: null, message: `Arrays of length ${length} updated for every last value.` })
  }
  const result = (up.reduce((a, b) => (a + b) % MOD, 0) + down.reduce((a, b) => (a + b) % MOD, 0)) % MOD
  frames.push({ phase: 'done', activeLine: L('return the sum of all up and down counts'), length: n, values, up: [...up], down: [...down], total: result, message: `Zigzag arrays of length ${n}: ${result}.` })
  return { input, result, frames }
}

export const code = `count zigzag arrays of length n with values from l to r
  for each value v, count the arrays of length 2 that end at v going up and going down
  build the transition that turns the up and down counts into the next length
  raise the transition to the power n minus 2 by repeated squaring
  apply the powered transition to the length 2 counts
  return the sum of all up and down counts modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def number_of_zigzag_arrays_ii(n, l, r):
    MOD = 10**9 + 7
    m = r - l + 1
    size = 2 * m
    # States 0..m-1 are "last step up" for values l..r; states m..2m-1 are "last step down".
    T = [[0] * size for _ in range(size)]
    for w in range(m):
        for v in range(m):
            if v < w:
                T[w][m + v] = 1
            if v > w:
                T[m + w][v] = 1

    def mul(A, B):
        C = [[0] * size for _ in range(size)]
        for i in range(size):
            Ci = C[i]
            for k in range(size):
                a = A[i][k]
                if a:
                    Bk = B[k]
                    for j in range(size):
                        Ci[j] += a * Bk[j]
            for j in range(size):
                Ci[j] %= MOD
        return C

    P = [[int(i == j) for j in range(size)] for i in range(size)]
    base = T
    e = n - 2
    while e:
        if e & 1:
            P = mul(P, base)
        base = mul(base, base)
        e >>= 1
    init = [v - l for v in range(l, r + 1)] + [r - v for v in range(l, r + 1)]
    total = 0
    for i in range(size):
        for j in range(size):
            total += P[i][j] * init[j]
    return total % MOD
`
