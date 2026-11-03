// LeetCode 1246: Palindrome Removal. dp[i][j] is the fewest moves that clear arr[i..j].
// Either arr[i] is removed alone, or arr[i] is removed together with some later equal arr[k]
// once the stretch between them has been cleared; the last clearing move absorbs both ends, and an
// adjacent equal pair costs one move on its own. Empty ranges cost 0.
const MAX_LENGTH = 10

export const phases = [
  { id: 'setup', label: 'Array', description: 'Read the array and make an empty table.' },
  { id: 'cell', label: 'Cell', description: 'Fill one range [i..j] of the table.' },
  { id: 'pair', label: 'Pair', description: 'Try pairing arr[i] with an equal arr[k].' },
  { id: 'store', label: 'Store', description: 'Keep the cheapest option for this range.' },
  { id: 'done', label: 'Answer', description: 'Report the cost of the whole array.' },
]

export const code = `FUNCTION minMoves(arr)
    n ← length of arr
    dp ← n by n table of 0; a range with start > end costs 0
    FOR length from 1 to n
        FOR i from 0 to n - length
            j ← i + length - 1
            best ← 1 + dp(i+1, j)
            FOR k from i+1 to j
                IF arr[k] = arr[i] THEN best ← min(best, middle(i, k) + dp(k+1, j))
            dp[i][j] ← best
    RETURN dp(0, n-1)`.split('\n').map((text, index) => ({ line: index + 1, text }))

const L = s => {
  const index = code.findIndex(entry => entry.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}

export const python = `def min_moves(arr):
    n = len(arr)
    dp = [[0] * n for _ in range(n)]

    def get(a, b):
        return dp[a][b] if a <= b else 0

    for length in range(1, n + 1):
        for i in range(0, n - length + 1):
            j = i + length - 1
            best = 1 + get(i + 1, j)
            for k in range(i + 1, j + 1):
                if arr[k] == arr[i]:
                    middle = 1 if k == i + 1 else get(i + 1, k - 1)
                    best = min(best, middle + get(k + 1, j))
            dp[i][j] = best
    return dp[0][n - 1]


if __name__ == "__main__":
    import sys, json
    print(json.dumps(min_moves(json.loads(sys.stdin.read()))))
`

const PYTHON_LINES = python.split('\n')
const P = s => {
  const index = PYTHON_LINES.findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function parseInput(text) {
  const arr = typeof text === 'string' ? JSON.parse(text) : text
  if (!Array.isArray(arr) || arr.length < 1 || arr.length > MAX_LENGTH) throw new Error(`Use an array of 1 to ${MAX_LENGTH} integers.`)
  if (!arr.every(Number.isInteger)) throw new Error('Every value is an integer.')
  return arr
}

export function buildTrace(arr) {
  const n = arr.length
  const frames = []
  const dp = Array.from({ length: n }, () => Array(n).fill(null))
  const get = (a, b) => (a <= b ? dp[a][b] : 0)
  const snapshot = () => dp.map(row => row.slice())
  const emit = (phase, codeText, pyText, message, extra = {}) => frames.push({
    phase, activeLine: L(codeText), pythonLine: P(pyText), message,
    i: -1, j: -1, single: null, pairs: [], best: null, table: snapshot(), answer: null, ...extra,
  })
  emit('setup', 'n ← length of arr', 'n = len(arr)', `${n} values; every range [i..j] gets its own cost.`)
  // Mirror of get() for the table so that empty ranges read as 0.
  const readCost = (a, b) => (a <= b ? dp[a][b] : 0)
  for (let length = 1; length <= n; length += 1) {
    for (let i = 0; i + length - 1 < n; i += 1) {
      const j = i + length - 1
      const single = 1 + readCost(i + 1, j)
      let best = single
      emit('cell', 'best ← 1 + dp(i+1, j)', 'best = 1 + get(i + 1, j)', `Range [${i}..${j}]: remove arr[${i}] alone for ${single}.`, { i, j, single, best, table: snapshot() })
      const pairs = []
      for (let k = i + 1; k <= j; k += 1) {
        if (arr[k] !== arr[i]) continue
        const middle = k === i + 1 ? 1 : readCost(i + 1, k - 1)
        const cost = middle + readCost(k + 1, j)
        pairs.push({ k, cost })
        emit('pair', 'IF arr[k] = arr[i] THEN best', 'if arr[k] == arr[i]', `arr[${k}] equals arr[${i}]; clear the middle, then pair them for ${cost}.`, { i, j, single, best, pairs: pairs.slice(), table: snapshot() })
        best = Math.min(best, cost)
      }
      dp[i][j] = best
      emit('store', 'dp[i][j] ← best', 'dp[i][j] = best', `Range [${i}..${j}] costs ${best}.`, { i, j, single, best, pairs: pairs.slice(), table: snapshot() })
    }
  }
  const answer = n ? dp[0][n - 1] : 0
  emit('done', 'RETURN dp(0, n-1)', 'return dp[0][n - 1]', `The whole array clears in ${answer} move${answer === 1 ? '' : 's'}.`, { i: 0, j: n - 1, answer, table: snapshot() })
  return { input: arr.slice(), result: answer, frames }
}
