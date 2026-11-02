export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 2 || nums.length > 20) throw new Error('Use a JSON array of 2 to 20 integers.')
  if (!nums.every(v => Number.isInteger(v) && Math.abs(v) <= 1000000000)) throw new Error('Each value is an integer from -1000000000 to 1000000000.')
  return { nums }
}

// Pseudocode and Python lookups fail fast when a referenced line is missing.
const L = s => {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`Missing pseudocode line: ${s}`)
  return index + 1
}
const P = s => {
  const index = python.split('\n').findIndex(line => line.includes(s))
  if (index < 0) throw new Error(`Missing python line: ${s}`)
  return index + 1
}

export function buildTrace({ nums }) {
  const n = nums.length
  // sufVal[i] and sufSrc[i] are the smallest value at or after i and the index it came from.
  const sufVal = Array(n).fill(null)
  const sufSrc = Array(n).fill(null)
  const frames = []
  let best = null
  let bestSplit = -1
  let bestPrefix = null
  let bestSuffixMin = null
  let prefix = null

  // Each frame stores copies of every array and scalar it displays, so back and seek never read later state.
  const push = (activeText, pythonText, phase, extra) => frames.push({
    phase,
    activeLine: L(activeText),
    pythonLine: P(pythonText),
    at: -1,
    split: -1,
    prefix: null,
    sufMin: null,
    sufMinFrom: null,
    score: null,
    ok: null,
    sufVal: [...sufVal],
    sufSrc: [...sufSrc],
    best,
    bestSplit,
    bestPrefix,
    bestSuffixMin,
    ...extra,
  })

  push('let n be the length', 'n = len(nums)', 'start', { message: `The array has ${n} values, so there are ${n - 1} possible splits.` })

  sufVal[n - 1] = nums[n - 1]
  sufSrc[n - 1] = n - 1
  push('suffix_min[n - 1] = nums[n - 1]', 'suffix_min[n - 1] = nums[n - 1]', 'suffix', {
    at: n - 1,
    message: `suffix_min[${n - 1}] = ${nums[n - 1]}, the last value alone (source index ${n - 1}).`,
  })

  for (let i = n - 2; i >= 0; i--) {
    const useCurrent = nums[i] <= sufVal[i + 1]
    sufVal[i] = useCurrent ? nums[i] : sufVal[i + 1]
    sufSrc[i] = useCurrent ? i : sufSrc[i + 1]
    push('suffix_min[i] = min(nums[i], suffix_min[i + 1])', 'suffix_min[i] = min(nums[i], suffix_min[i + 1])', 'suffix', {
      at: i,
      message: `suffix_min[${i}] = min(nums[${i}] = ${nums[i]}, suffix_min[${i + 1}] = ${sufVal[i + 1]}) = ${sufVal[i]}, from index ${sufSrc[i]}.`,
    })
  }

  prefix = 0
  push('set best to none and prefix to 0', 'best = None', 'prefix', {
    message: 'No retained optimum yet, and the prefix sum starts at 0.',
  })

  for (let k = 0; k < n - 1; k++) {
    prefix += nums[k]
    push('add nums[k] to prefix', 'prefix += nums[k]', 'prefix', {
      at: k,
      split: k,
      prefix,
      message: `Split after index ${k}: the prefix nums[0..${k}] now sums to ${prefix}.`,
    })

    const suffixMin = sufVal[k + 1]
    const score = prefix - suffixMin
    push('score is prefix minus suffix_min[k + 1]', 'score = prefix - suffix_min[k + 1]', 'score', {
      at: k + 1,
      split: k,
      prefix,
      sufMin: suffixMin,
      sufMinFrom: sufSrc[k + 1],
      score,
      message: `Candidate for split ${k}: ${prefix} - suffix min ${suffixMin} (from index ${sufSrc[k + 1]}) = ${score}.`,
    })

    const improves = best === null || score > best
    push('if best is none or score is greater than best', 'if best is None or score > best:', 'score', {
      at: k + 1,
      split: k,
      prefix,
      sufMin: suffixMin,
      sufMinFrom: sufSrc[k + 1],
      score,
      ok: improves,
      message: improves
        ? `${score} beats the retained optimum${best === null ? ' (there is none yet)' : ` ${best}`}.`
        : `${score} does not beat the retained optimum ${best}, so the optimum is kept.`,
    })

    if (improves) {
      best = score
      bestSplit = k
      bestPrefix = prefix
      bestSuffixMin = suffixMin
      push('then best = score', 'best = score', 'improve', {
        at: k + 1,
        split: k,
        prefix,
        sufMin: suffixMin,
        sufMinFrom: sufSrc[k + 1],
        score,
        ok: true,
        message: `Retained optimum is now ${best}, from split ${bestSplit}.`,
      })
    }
  }

  push('return best', 'return best', 'done', {
    split: bestSplit,
    prefix: bestPrefix,
    sufMin: bestSuffixMin,
    score: best,
    ok: true,
    message: `Maximum score is ${best}, from split after index ${bestSplit}: prefix ${bestPrefix} minus suffix min ${bestSuffixMin}.`,
  })
  return { input: { nums }, result: best, frames }
}

export const code = `maximum score of a split of nums
  let n be the length of nums
  suffix_min[n - 1] = nums[n - 1]
  for i from n - 2 down to 0
    suffix_min[i] = min(nums[i], suffix_min[i + 1])
  set best to none and prefix to 0
  for each split k from 0 to n - 2
    add nums[k] to prefix
    score is prefix minus suffix_min[k + 1]
    if best is none or score is greater than best
    then best = score
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))

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
