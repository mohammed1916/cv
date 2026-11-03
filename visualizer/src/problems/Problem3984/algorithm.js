const MOD = 1000000007
const MAX_LEN = 30
const MAX_VALUE = 30

function lookup(lines, text) {
  const index = lines.findIndex(line => line.text.includes(text))
  if (index < 0) throw new Error(`Missing trace line: ${text}`)
  return index + 1
}

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > MAX_LEN) throw new Error(`Use a JSON array of 1 to ${MAX_LEN} values.`)
  for (const v of nums) {
    if (!Number.isInteger(v) || v < 1 || v > MAX_VALUE) throw new Error(`Each value must be an integer from 1 to ${MAX_VALUE}.`)
  }
  return { nums }
}

export function buildTrace({ nums }) {
  const L = text => lookup(code, text)
  const P = text => lookup(pyLines, text)
  const frames = []
  const maxV = Math.max(...nums)
  let bestScore = null
  let bestK = null
  frames.push({ pythonLine: P('MOD = '), phase: 'start', activeLine: L('set bestScore and bestK'), k: null, i: -1, weights: [], cur: null, kBest: null, bestScore, bestK, message: 'Try every k from 2 up to one past the largest value.' })
  for (let k = 2; k <= maxV + 1; k++) {
    frames.push({ pythonLine: P('for k in range'), phase: 'k', activeLine: L('for k from 2'), k, i: -1, weights: [], cur: null, kBest: null, bestScore, bestK, message: `Score every element with k = ${k}.` })
    let cur = null
    let kBest = null
    const weights = []
    nums.forEach((v, i) => {
      const w = v % k === 0 ? v : -v
      weights.push(w)
      cur = cur === null ? w : Math.max(w, cur + w)
      kBest = kBest === null ? cur : Math.max(kBest, cur)
      frames.push({ pythonLine: P('cur = w if cur is None'), phase: 'weigh', activeLine: L('cur = w if cur unknown'), k, i, weights: weights.slice(), cur, kBest, bestScore, bestK, message: `${v} ${v % k === 0 ? 'is divisible' : 'is not divisible'} by ${k}, so it counts ${w}. Best interval ending here is ${cur}.` })
    })
    if (bestScore === null || kBest > bestScore) {
      bestScore = kBest
      bestK = k
      frames.push({ pythonLine: P('best_score = k_best'), phase: 'keep', activeLine: L('if bestScore unknown or'), k, i: nums.length - 1, weights: weights.slice(), cur, kBest, bestScore, bestK, message: `k = ${k} gives the best score so far, ${kBest}.` })
    } else {
      frames.push({ pythonLine: P('if best_score is None or'), phase: 'skip', activeLine: L('if bestScore unknown or'), k, i: nums.length - 1, weights: weights.slice(), cur, kBest, bestScore, bestK, message: `k = ${k} scores ${kBest}, which does not beat ${bestScore}.` })
    }
  }
  const scaled = ((bestScore * bestK) % MOD + MOD) % MOD
  frames.push({ pythonLine: P('return (best_score'), phase: 'done', activeLine: L('return (bestScore * bestK)'), k: bestK, i: -1, weights: [], cur: null, kBest: null, bestScore, bestK, message: `Best score ${bestScore} with k = ${bestK}; the answer is ${scaled}.` })
  return { input: { nums }, result: scaled, frames }
}

export const code = `maximum divisible game score times k
  set bestScore and bestK to unknown
  for k from 2 to maxValue + 1
    cur = unknown, kBest = unknown
    for each v in nums
      w = v if v mod k == 0 else -v
      cur = w if cur unknown else max(w, cur + w)
      kBest = cur if kBest unknown else max(kBest, cur)
    if bestScore unknown or kBest > bestScore then bestScore, bestK = kBest, k
  return (bestScore * bestK) mod 1000000007, kept non-negative`.split('\n').map((text, index) => ({ line: index + 1, text }))

export const python = `def divisible_game(nums):
    MOD = 10**9 + 7
    best_score = None
    best_k = None
    for k in range(2, max(nums) + 2):
        cur = None
        k_best = None
        for v in nums:
            w = v if v % k == 0 else -v
            cur = w if cur is None else max(w, cur + w)
            k_best = cur if k_best is None else max(k_best, cur)
        if best_score is None or k_best > best_score:
            best_score = k_best
            best_k = k
    return (best_score * best_k) % MOD
`

const pyLines = python.split('\n').map((text, index) => ({ line: index + 1, text }))
