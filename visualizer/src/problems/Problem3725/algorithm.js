const MOD = 1000000007

export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.mat)) throw new Error('Use an object with a mat array of rows.')
  if (obj.mat.length < 1 || obj.mat.length > 4) throw new Error('Use 1 to 4 rows for the visualization.')
  if (obj.mat.some(row => !Array.isArray(row) || row.length < 1 || row.length > 4 || row.length !== obj.mat[0].length)) throw new Error('Every row needs the same length, from 1 to 4.')
  if (obj.mat.some(row => row.some(v => !Number.isInteger(v) || v < 1 || v > 150))) throw new Error('Entries are integers from 1 to 150.')
  return { mat: obj.mat }
}

const mobius = d => {
  let result = 1
  let x = d
  for (let p = 2; p * p <= x; p++) {
    if (x % p === 0) {
      x /= p
      if (x % p === 0) return 0
      result = -result
    }
  }
  if (x > 1) result = -result
  return result
}

export function buildTrace(input) {
  const { mat } = input
  const top = Math.max(...mat.flat())
  let answer = 0
  const frames = [{ phase: 'start', activeLine: L('set answer to 0'), d: 0, mu: 0, ways: 0, answer, message: 'Count picks whose gcd is 1 by removing the picks that share each divisor d, using the Mobius function.' }]
  for (let d = 1; d <= top; d++) {
    const mu = mobius(d)
    if (mu === 0) {
      frames.push({ phase: 'skip', activeLine: L('if mu is zero'), d, mu, ways: 0, answer, message: `${d} has a squared prime factor, so its Mobius value is 0. Skip it.` })
      continue
    }
    let ways = 1
    for (const row of mat) ways = (ways * row.filter(v => v % d === 0).length) % MOD
    answer = (((answer + mu * ways) % MOD) + MOD) % MOD
    frames.push({ phase: 'add', activeLine: L('add mu times ways'), d, mu, ways, answer, message: `d = ${d}, mu = ${mu}: picks divisible by ${d} contribute ${mu * ways} (ways ${ways}).` })
  }
  frames.push({ phase: 'done', activeLine: L('return answer modulo'), d: 0, mu: 0, ways: 0, answer, message: `Coprime choices: ${answer}.` })
  return { input, result: answer, frames }
}

export const code = `count choices with gcd 1:
  set answer to 0
  for each d from 1 to the largest entry:
    set mu to the Mobius value of d
    if mu is zero then
      skip this d
    otherwise
      set ways to 1
      for each row, multiply ways by the number of entries divisible by d
      add mu times ways to answer
  return answer modulo 1000000007`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_coprime_row_choices(mat):
    MOD = 10 ** 9 + 7

    def mobius(d):
        result = 1
        x = d
        p = 2
        while p * p <= x:
            if x % p == 0:
                x //= p
                if x % p == 0:
                    return 0
                result = -result
            p += 1
        if x > 1:
            result = -result
        return result

    top = max(max(row) for row in mat)
    answer = 0
    for d in range(1, top + 1):
        mu = mobius(d)
        if mu == 0:
            continue
        ways = 1
        for row in mat:
            ways = ways * sum(1 for v in row if v % d == 0) % MOD
        answer = (answer + mu * ways) % MOD
    return answer
`
