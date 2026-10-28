export function parseInput(text) {
  const obj = JSON.parse(text)
  if (!obj || typeof obj !== 'object' || !Array.isArray(obj.nums)) throw new Error('Use an object with a nums array.')
  if (obj.nums.length < 1 || obj.nums.length > 12) throw new Error('Use 1 to 12 values for the visualization.')
  if (obj.nums.some(v => !Number.isInteger(v) || v < 1 || v > 1000000000)) throw new Error('Values are integers from 1 to 1000000000.')
  return { nums: obj.nums }
}

const reverseDigits = x => Number(String(x).split('').reverse().join(''))

export function buildTrace(input) {
  const { nums } = input
  const last = new Map()
  let best = -1
  const frames = [{ phase: 'start', activeLine: L('set last to an empty map'), index: -1, best, value: null, message: 'Track the latest index i for each reversed value of an earlier element.' }]
  nums.forEach((x, j) => {
    if (last.has(x)) {
      const gap = j - last.get(x)
      if (best === -1 || gap < best) best = gap
      frames.push({ phase: 'match', activeLine: L('if x is a key in last'), index: j, best, value: x, message: `${x} equals the reverse of nums[${last.get(x)}]. Gap ${gap}. Best: ${best}.` })
    }
    last.set(reverseDigits(x), j)
    frames.push({ phase: 'record', activeLine: L('set last[reverse'), index: j, best, value: x, message: `Record reverse(${x}) = ${reverseDigits(x)} at index ${j}.` })
  })
  frames.push({ phase: 'done', activeLine: L('return best'), index: -1, best, value: null, message: `Smallest mirror-pair gap: ${best}.` })
  return { input, result: best, frames }
}

export const code = `minimum distance between mirror pairs:
  set last to an empty map
  set best to -1
  for each index j with value x = nums[j]:
    if x is a key in last then
      set best to the smaller of best and j minus last[x]
    set last[reverse(x)] to j
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def min_mirror_pair_distance(nums):
    last = {}
    best = -1
    for j, x in enumerate(nums):
        if x in last:
            gap = j - last[x]
            if best == -1 or gap < best:
                best = gap
        last[int(str(x)[::-1])] = j
    return best
`
