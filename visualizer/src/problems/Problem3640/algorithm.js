const NONE = -Infinity

// Dynamic programming over indices. run[i] is the best strictly rising run ending at i (any length).
// rise[i] is the best such run of length at least two, ending at a peak candidate i.
// fall[i] is the best trionic prefix ending at i while descending. climb[i] is the best full trionic
// subarray ending at i while rising for the last part.
function scanStates(nums) {
  const n = nums.length
  const run = new Array(n).fill(NONE)
  const rise = new Array(n).fill(NONE)
  const fall = new Array(n).fill(NONE)
  const climb = new Array(n).fill(NONE)
  run[0] = nums[0]
  let best = NONE
  for (let i = 1; i < n; i++) {
    if (nums[i - 1] < nums[i]) {
      rise[i] = nums[i] + run[i - 1]
      climb[i] = nums[i] + Math.max(climb[i - 1], fall[i - 1])
      run[i] = nums[i] + Math.max(0, run[i - 1])
    } else {
      run[i] = nums[i]
    }
    if (nums[i - 1] > nums[i]) fall[i] = nums[i] + Math.max(rise[i - 1], fall[i - 1])
    best = Math.max(best, climb[i])
  }
  return { run, rise, fall, climb, best }
}

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || !Array.isArray(input.nums)) throw new Error('Use an object with a "nums" array.')
  const { nums } = input
  if (nums.length < 4 || nums.length > 30) throw new Error('nums holds 4 to 30 integers.')
  if (nums.some(v => !Number.isInteger(v) || v < -50 || v > 50)) throw new Error('Each number is an integer from -50 to 50.')
  if (scanStates(nums).best === NONE) throw new Error('The array must contain a trionic subarray.')
  return { nums }
}

const shown = v => (Number.isFinite(v) ? v : null)

export function buildTrace(input) {
  const { nums } = input
  const { run, rise, fall, climb, best } = scanStates(nums)
  const frames = [{ phase: 'start', activeLine: L('set best to negative infinity'), index: 0, run: nums[0], rise: null, fall: null, climb: null, best: null, message: 'Begin with the first value as a rising run of length one.' }]
  let running = NONE
  for (let i = 1; i < nums.length; i++) {
    running = Math.max(running, climb[i])
    const line = nums[i - 1] < nums[i] ? L('set rise[i]') : nums[i - 1] > nums[i] ? L('set fall[i]') : L('otherwise set run[i]')
    frames.push({ phase: 'scan', activeLine: line, index: i, run: shown(run[i]), rise: shown(rise[i]), fall: shown(fall[i]), climb: shown(climb[i]), best: shown(running), message: `At index ${i}: rising run ${shown(run[i]) ?? 'none'}, falling ${shown(fall[i]) ?? 'none'}, full trionic ${shown(climb[i]) ?? 'none'}.` })
  }
  frames.push({ phase: 'done', activeLine: L('return best'), index: -1, run: null, rise: null, fall: null, climb: null, best, message: `The largest trionic subarray sum is ${best}.` })
  return { input, nums, result: best, frames }
}

export const code = `largest sum of a trionic subarray
  set best to negative infinity
  set run at index zero to the first value
  for each index i from one to the last index
    if the previous value is less than this value then
      set rise[i] to this value plus run[i - 1]
      set climb[i] to this value plus the larger of climb[i - 1] and fall[i - 1]
      set run[i] to this value plus the larger of zero and run[i - 1]
    otherwise set run[i] to this value
    if the previous value is greater than this value then
      set fall[i] to this value plus the larger of rise[i - 1] and fall[i - 1]
    set best to the larger of best and climb[i]
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def max_trionic_sum(nums):
    n = len(nums)
    NEG = float('-inf')
    run = [NEG] * n
    rise = [NEG] * n
    fall = [NEG] * n
    climb = [NEG] * n
    run[0] = nums[0]
    best = NEG
    for i in range(1, n):
        if nums[i - 1] < nums[i]:
            rise[i] = nums[i] + run[i - 1]
            climb[i] = nums[i] + max(climb[i - 1], fall[i - 1])
            run[i] = nums[i] + max(0, run[i - 1])
        else:
            run[i] = nums[i]
        if nums[i - 1] > nums[i]:
            fall[i] = nums[i] + max(rise[i - 1], fall[i - 1])
        best = max(best, climb[i])
    return best
`
