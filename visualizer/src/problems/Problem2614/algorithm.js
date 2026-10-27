export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input) || !Array.isArray(input.nums)) throw new Error('Use an object with a square nums matrix.')
  const { nums } = input
  const n = nums.length
  if (n < 1 || n > 6) throw new Error('The matrix must be 1 to 6 rows high.')
  if (nums.some(row => !Array.isArray(row) || row.length !== n)) throw new Error('The matrix must be square.')
  if (nums.some(row => row.some(v => !Number.isInteger(v) || v < 1 || v > 50))) throw new Error('Each value is an integer from 1 to 50.')
  return { nums }
}

const isPrime = n => {
  if (n < 2) return false
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false
  return true
}

export function buildTrace({ nums }) {
  const n = nums.length
  const frames = []
  let best = 0
  frames.push({ phase: 'start', activeLine: L('set best to 0'), row: -1, col: -1, best, message: 'Start with no prime found.' })
  for (let i = 0; i < n; i++) {
    frames.push({ phase: 'row', activeLine: L('for each row i'), row: i, col: i, best, message: `Row ${i}: check the diagonal cells.` })
    for (const col of [i, n - 1 - i]) {
      const value = nums[i][col]
      const kind = col === i ? 'main' : 'anti'
      if (isPrime(value) && value > best) {
        best = value
        frames.push({ phase: 'record', activeLine: L('if its value is prime'), row: i, col, best, message: `${value} on the ${kind} diagonal is prime and the largest so far.` })
      } else {
        frames.push({ phase: 'skip', activeLine: L('if its value is prime'), row: i, col, best, message: `${value} on the ${kind} diagonal does not beat ${best}.` })
      }
      if (n - 1 - i === i) break
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), row: -1, col: -1, best, message: `Largest prime on either diagonal: ${best}.` })
  return { input: { nums }, result: best, frames }
}

export const code = `largest prime on either diagonal of a square matrix
  set best to 0
  for each row i from 0 to n minus 1
    for each of the two diagonal cells in row i, the main one and the anti-diagonal one
      if its value is prime and larger than best then set best to it
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def largest_prime_on_diagonals(nums):
    def is_prime(x):
        if x < 2:
            return False
        d = 2
        while d * d <= x:
            if x % d == 0:
                return False
            d += 1
        return True

    n = len(nums)
    best = 0
    for i in range(n):
        for value in (nums[i][i], nums[i][n - 1 - i]):
            if is_prime(value) and value > best:
                best = value
    return best
`
