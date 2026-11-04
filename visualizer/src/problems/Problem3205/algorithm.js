// LeetCode 3205: Maximum Array Hopping Score I.
// Let best[j] be the largest score of any hop sequence from index 0 that ends at j.
// The last hop into j comes from some earlier i and scores (j - i) * nums[j], so best[j] = max over i < j of best[i] + (j - i) * nums[j].

const CODE_TEXT = `function maxHopScore(nums) {
  const n = nums.length
  const best = [0]
  for (let j = 1; j < n; j++) {
    best[j] = -Infinity
    for (let i = 0; i < j; i++) {
      const candidate = best[i] + (j - i) * nums[j]
      if (candidate > best[j]) best[j] = candidate
    }
  }
  return best[n - 1]
}`.split('\n')
export const code = CODE_TEXT.map((text, index) => ({ line: index + 1, text }))

export const python = `def max_hop_score(nums):
    n = len(nums)
    best = [0] * n
    for j in range(1, n):
        best[j] = float("-inf")
        for i in range(j):
            candidate = best[i] + (j - i) * nums[j]
            if candidate > best[j]:
                best[j] = candidate
    return best[n - 1]


if __name__ == "__main__":
    import json, sys
    print(max_hop_score(json.loads(sys.stdin.read())))
`

const PY_LINES = python.split('\n')
const L = s => { const n = code.findIndex(c => c.text.includes(s)) + 1; if (!n) throw new Error(`Missing pseudocode line: ${s}`); return n }
const P = s => { const n = PY_LINES.findIndex(l => l.includes(s)) + 1; if (!n) throw new Error(`Missing Python line: ${s}`); return n }

export const phases = [
  { id: 'start', label: 'Start', description: 'Index 0 has score 0.' },
  { id: 'target', label: 'Target', description: 'Choose the landing index j.' },
  { id: 'hop', label: 'Hop', description: 'Compare a hop from an earlier index i.' },
  { id: 'keep', label: 'Keep', description: 'This hop is the best so far for j.' },
  { id: 'done', label: 'Result', description: 'Report the score at the last index.' },
]

export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 10) throw new Error('nums is an array of 1 to 10 integers.')
  if (!nums.every(v => Number.isInteger(v) && v >= 0 && v <= 100)) throw new Error('Each value is an integer from 0 to 100.')
  return nums.slice()
}

export function buildTrace(nums) {
  const n = nums.length
  const best = Array(n).fill(null)
  const from = Array(n).fill(-1)
  const frames = []
  const snap = (extra) => ({ nums, n, best: best.slice(), from: from.slice(), ...extra })
  frames.push(snap({ phase: 'start', activeLine: L('function maxHopScore'), pythonLine: P('def max_hop'), j: -1, i: -1, candidate: null, message: n === 1 ? 'One index: no hop is needed, the score is 0.' : `Start at index 0 with score 0; ${n} indices in total.` }))
  best[0] = 0
  frames.push(snap({ phase: 'start', activeLine: L('const best = [0]'), pythonLine: P('best = [0] * n'), j: 0, i: -1, candidate: null, message: 'best[0] is 0 because no hop has been made.' }))
  for (let j = 1; j < n; j++) {
    best[j] = -Infinity
    frames.push(snap({ phase: 'target', activeLine: L('for (let j = 1'), pythonLine: P('for j in range(1, n)'), j, i: -1, candidate: null, message: `Find the best way to land on index ${j}.` }))
    for (let i = 0; i < j; i++) {
      const candidate = best[i] + (j - i) * nums[j]
      const improves = candidate > best[j]
      if (improves) { best[j] = candidate; from[j] = i }
      frames.push(snap({ phase: improves ? 'keep' : 'hop', activeLine: improves ? L('if (candidate > best[j])') : L('const candidate ='), pythonLine: improves ? P('best[j] = candidate') : P('candidate = best[i]'), j, i, candidate, improves, message: `Hop ${i} to ${j}: ${best[i]} + ${j - i} * ${nums[j]} = ${candidate}. ${improves ? 'New best for ' + j + '.' : 'Not better than ' + best[j] + '.'}` }))
    }
  }
  const answer = best[n - 1] === null ? 0 : best[n - 1]
  frames.push(snap({ phase: 'done', activeLine: L('return best[n - 1]'), pythonLine: P('return best[n - 1]'), j: n - 1, i: -1, candidate: null, message: `Best score reaching index ${n - 1}: ${answer}.` }))
  return { input: nums, result: answer, frames }
}
