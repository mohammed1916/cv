export function parseInput(text) {
  const input = JSON.parse(text)
  const nums = input?.nums
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12) throw new Error('Give nums as an array of 1 to 12 entries.')
  if (nums.some(v => !Number.isInteger(v) || v < 1 || v > 4)) throw new Error('Each value in nums is an integer from 1 to 4.')
  if (!Number.isInteger(input.k) || input.k < 0 || input.k > 5) throw new Error('k is an integer from 0 to 5.')
  return { nums, k: input.k }
}

export function buildTrace({ nums, k }) {
  const positions = new Map()
  nums.forEach((v, i) => positions.set(v, [...(positions.get(v) ?? []), i]))
  const frames = [{ phase: 'start', activeLine: L('set best to zero'), value: null, from: 0, to: -1, best: 0, message: `Group the positions of each value. Deleting gaps inside a window costs one per element that is not the value.` }]
  let best = 0
  for (const [value, places] of positions) {
    let left = 0
    frames.push({ phase: 'group', activeLine: L('for each distinct value'), value, from: places[0], to: places[0] - 1, best, positions: places, message: `Look at the positions of ${value}: ${places.join(', ')}.` })
    for (let right = 0; right < places.length; right++) {
      while ((places[right] - places[left] + 1) - (right - left + 1) > k) {
        left++
        frames.push({ phase: 'shrink', activeLine: L('move left to the next position'), value, from: places[left], to: places[right], best, positions: places, message: `Deleting the gaps from ${places[left]} to ${places[right]} costs too much, so move to the next ${value}.` })
      }
      best = Math.max(best, right - left + 1)
      frames.push({ phase: 'record', activeLine: L('set best to the larger'), value, from: places[left], to: places[right], best, positions: places, message: `Keeping ${right - left + 1} copies of ${value} from ${places[left]} to ${places[right]} is allowed. Best ${best}.` })
    }
  }
  frames.push({ phase: 'done', activeLine: L('return best'), value: null, from: 0, to: -1, best, message: `The longest equal subarray has length ${best}.` })
  return { input: { nums, k }, result: best, frames }
}

export const code = `longest equal subarray (nums, k)
  set best to zero
  for each distinct value v
    set left to zero
    for each position right holding v
      while the deleted gaps from left to right are above k
        move left to the next position of v
      set best to the larger of best and the count of v in the window
  return best`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def longest_equal_subarray(nums, k):
    positions = {}
    for index, value in enumerate(nums):
        positions.setdefault(value, []).append(index)
    best = 0
    for places in positions.values():
        left = 0
        for right in range(len(places)):
            while (places[right] - places[left] + 1) - (right - left + 1) > k:
                left += 1
            best = max(best, right - left + 1)
    return best
`
