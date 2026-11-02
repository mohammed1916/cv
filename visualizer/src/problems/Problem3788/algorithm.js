export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 20) throw new Error('Use a JSON array of 2 to 20 integers.')
  if (!nums.every(v => Number.isInteger(v) && Math.abs(v) <= 1000000000)) throw new Error('Each value is an integer from -1000000000 to 1000000000.')
  return { nums }
}

export function buildTrace({ nums }) {
  const n = nums.length
  const suffixMin = Array(n).fill(0)
  const frames = []
  const push = (pythonLine, phase, activeText, extra) => frames.push({
    pythonLine, phase, activeLine: L(activeText), at: -1, split: -1, suffixFrom: -1,
    prefix: null, suffixMin: null, score: null, best: null, ok: null, ...extra,
  })

  push(2, 'start', 'let n be the length', { message: `The array has ${n} values.` })

  suffixMin[n - 1] = nums[n - 1]
  push(4, 'suffix', 'build suffix_min', { at: n - 1, suffixFrom: n - 1, suffixMin: suffixMin[n - 1], message: `suffix_min[${n - 1}] = ${suffixMin[n - 1]}, the last value alone.` })
  for (let i = n - 2; i >= 0; i--) {
    suffixMin[i] = Math.min(nums[i], suffixMin[i + 1])
    push(6, 'suffix', 'build suffix_min', { at: i, suffixFrom: i, suffixMin: suffixMin[i], message: `suffix_min[${i}] = min(${nums[i]}, ${suffixMin[i + 1]}) = ${suffixMin[i]}.` })
  }

  let best = null
  let prefix = 0
  push(7, 'prefix', 'set best to none', { suffixFrom: 0, best, prefix, message: 'No best score yet; the prefix sum starts at 0.' })

  for (let k = 0; k < n - 1; k++) {
    prefix += nums[k]
    push(10, 'prefix', 'add nums[k] to prefix', { at: k, split: k, suffixFrom: 0, prefix, message: `Prefix through index ${k} totals ${prefix}.` })
    const score = prefix - suffixMin[k + 1]
    push(11, 'score', 'score is prefix minus suffix_min', { at: k + 1, split: k, suffixFrom: 0, prefix, suffixMin: suffixMin[k + 1], score, best, message: `Score ${prefix} - ${suffixMin[k + 1]} = ${score}.` })
    const improves = best === null || score > best
    push(12, 'score', 'if best is none or score is greater', { at: k + 1, split: k, suffixFrom: 0, prefix, suffixMin: suffixMin[k + 1], score, best, ok: improves, message: improves ? `${score} is the best so far.` : `${score} does not beat ${best}.` })
    if (improves) {
      best = score
      push(13, 'improve', 'then best = score', { at: k + 1, split: k, suffixFrom: 0, prefix, suffixMin: suffixMin[k + 1], score, best, ok: true, message: `Best is now ${best}.` })
    }
  }

  push(14, 'done', 'return best', { suffixFrom: 0, prefix, best, ok: true, message: `Maximum score is ${best}.` })
  return { input: { nums }, result: best, frames }
}

export const code = `maximum score of a split of nums
  let n be the length of nums
  build suffix_min where suffix_min[i] is the smallest value from index i to the end
  set best to none and prefix to 0
  for each split k from 0 to n minus 2
    add nums[k] to prefix
    score is prefix minus suffix_min[k + 1]
    if best is none or score is greater than best then best = score
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def maximum_score_of_a_split(nums):
    n = len(nums)
    suffix_min = [0] * n
    suffix_min[n - 1] = nums[n - 1]
    for i in range(n - 2, -1, -1):
        suffix_min[i] = min(nums[i], suffix_min[i + 1])
    best = None
    prefix = 0
    for k in range(n - 1):
        prefix += nums[k]
        score = prefix - suffix_min[k + 1]
        if best is None or score > best:
            best = score
    return best

if __name__ == "__main__":
    print(maximum_score_of_a_split([10, -1, 3, -4, -5]))
`
