export function parseInput(text) {
  const nums = JSON.parse(text)
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 20) throw new Error('Use a JSON array of 1 to 20 integers.')
  if (!nums.every(v => Number.isInteger(v) && Math.abs(v) <= 1000)) throw new Error('Each value is an integer between -1000 and 1000.')
  return { nums }
}

// Each frame is a full snapshot: k is the suffix start (the provisional removal count is k while phase is not 'done').
// left/right are the two compared indices (or -1), leftValue/rightValue their values, verdict is 'ok', 'violation' or ''.
export function buildTrace({ nums }) {
  const frames = []
  let k = nums.length - 1
  const base = () => ({ k, left: -1, right: -1, leftValue: null, rightValue: null, verdict: '' })
  frames.push({ ...base(), pythonLine: 2, phase: 'start', activeLine: L('let k = nums.length - 1'),
    message: `Start with the retained suffix [${k}..${nums.length - 1}]. A single element is always strictly increasing, so no removal is proven yet.` })
  while (true) {
    if (k === 0) {
      frames.push({ ...base(), pythonLine: 3, phase: 'compare', activeLine: L('while (k > 0'),
        message: 'k reached 0, so the whole array is strictly increasing and nothing must be removed.' })
      break
    }
    const leftValue = nums[k - 1], rightValue = nums[k]
    const ok = leftValue < rightValue
    frames.push({ ...base(), left: k - 1, right: k, leftValue, rightValue, verdict: ok ? 'ok' : 'violation',
      pythonLine: 3, phase: 'compare', activeLine: L('while (k > 0'),
      message: ok
        ? `Check ${leftValue} < ${rightValue}: true, so index ${k - 1} can join the retained suffix.`
        : `Check ${leftValue} < ${rightValue}: false (${leftValue} >= ${rightValue}). Stop here: index ${k - 1} must be removed, so the boundary stays at k = ${k}.` })
    if (!ok) break
    k -= 1
    frames.push({ ...base(), left: k, right: k + 1, leftValue: nums[k], rightValue: nums[k + 1], verdict: 'ok',
      pythonLine: 4, phase: 'extend', activeLine: L('k -= 1'),
      message: `Extend the retained suffix to start at ${k}. The removal count is provisional at ${k}.` })
  }
  const result = k
  frames.push({ ...base(), k: result, pythonLine: 5, phase: 'done', activeLine: L('return k'),
    message: `Done: remove the first ${result} element${result === 1 ? '' : 's'} (final), keep indices ${result}..${nums.length - 1}.` })
  return { input: { nums }, result, frames }
}

export const code = `function minPrefixRemoval(nums) {
  let k = nums.length - 1
  while (k > 0 && nums[k - 1] < nums[k]) k -= 1
  return k
}`.split('\n').map((text, index) => ({ line: index + 1, text }))

// Fails fast: a missing pseudocode phrase must never silently map to line 0.
function L(s) {
  const index = code.findIndex(c => c.text.includes(s))
  if (index < 0) throw new Error(`3818 pseudocode line not found: "${s}"`)
  return index + 1
}

export const python = `def min_prefix_removal(nums):
    k = len(nums) - 1
    while k > 0 and nums[k - 1] < nums[k]:
        k -= 1
    return k
`
