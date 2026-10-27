const BITS = 7

export function parseInput(text) {
  const input = JSON.parse(text)
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Use an object with nums, low and high.')
  const { nums, low, high } = input
  if (!Array.isArray(nums) || nums.length < 1 || nums.length > 12 || nums.some(v => !Number.isInteger(v) || v < 1 || v > 50)) throw new Error('nums has 1 to 12 integers from 1 to 50.')
  if (!Number.isInteger(low) || !Number.isInteger(high) || low < 1 || high > 60 || low > high) throw new Error('Use integers with 1 <= low <= high <= 60.')
  return { nums, low, high }
}

const newNode = () => ({ child: [null, null], count: 0 })

// Number of pairs i < j with nums[i] xor nums[j] strictly below limit.
function countBelow(nums, limit, frames, phase, label) {
  const root = newNode()
  let total = 0
  nums.forEach((x, index) => {
    let node = root
    for (let b = BITS - 1; b >= 0 && node; b--) {
      const xb = (x >> b) & 1
      if ((limit >> b) & 1) {
        if (node.child[xb]) total += node.child[xb].count
        node = node.child[1 - xb]
      } else {
        node = node.child[xb]
      }
    }
    node = root
    node.count++
    for (let b = BITS - 1; b >= 0; b--) {
      const bit = (x >> b) & 1
      if (!node.child[bit]) node.child[bit] = newNode()
      node = node.child[bit]
      node.count++
    }
    if (frames) frames.push({ phase, activeLine: L('for each element'), index, limit, pairs: total, label, message: `Element ${x} at index ${index} adds ${total} pairs below ${limit} so far.` })
  })
  return total
}

export function buildTrace({ nums, low, high }) {
  const frames = [{ phase: 'start', activeLine: L('count pairs'), index: -1, limit: high + 1, pairs: 0, label: 'high', message: `Count pairs with xor at most ${high}, which is the same as below ${high + 1}.` }]
  const atMost = countBelow(nums, high + 1, frames, 'count', 'high')
  const lowerPart = countBelow(nums, low, frames, 'subtract', 'low')
  frames.push({ phase: 'subtract', activeLine: L('return below('), index: nums.length, limit: low, pairs: atMost - lowerPart, label: 'done', message: `Pairs with xor from ${low} to ${high}: ${atMost} minus ${lowerPart}.` })
  return { input: { nums, low, high }, result: atMost - lowerPart, frames }
}

export const code = `count pairs i < j whose xor lies in [low, high]
define below(limit) as the number of pairs whose xor is less than limit
for each element x of nums in order do
  count the earlier values y with x xor y below limit, by walking a trie of the earlier values
  insert x into the trie and update the counts
return below(high + 1) minus below(low)`.split('\n').map((text, index) => ({ line: index + 1, text }))
const L = s => code.findIndex(c => c.text.includes(s)) + 1

export const python = `def count_pairs_in_range(nums, low, high):
    BITS = 7

    def below(limit):
        root = [None, None, 0]
        total = 0
        for x in nums:
            node = root
            for b in range(BITS - 1, -1, -1):
                if node is None:
                    break
                xb = (x >> b) & 1
                if (limit >> b) & 1:
                    if node[xb] is not None:
                        total += node[xb][2]
                    node = node[1 - xb]
                else:
                    node = node[xb]
            node = root
            node[2] += 1
            for b in range(BITS - 1, -1, -1):
                xb = (x >> b) & 1
                if node[xb] is None:
                    node[xb] = [None, None, 0]
                node = node[xb]
                node[2] += 1
        return total

    return below(high + 1) - below(low)
`
